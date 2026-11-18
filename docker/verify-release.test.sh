#!/usr/bin/env bash
# Self-test of verify-release.sh with a throwaway key: a good release passes,
# and every kind of tampering is refused. Run: bash docker/verify-release.test.sh
set -euo pipefail

here=$(cd "$(dirname "$0")" && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
version=9.9.9-test.1

openssl genpkey -algorithm ed25519 -out "$work/test.key" 2>/dev/null
openssl pkey -in "$work/test.key" -pubout -out "$work/test.pub"
key_sha=$(openssl pkey -pubin -in "$work/test.pub" -outform DER | sha256sum | awk '{print $1}')

# make_release <folder> [extra file in the amd64 archive]
make_release() {
	local dir=$1 extra=${2:-}
	for arch in amd64 arm64; do
		mkdir -p "$dir/src-$arch"
		echo "program $arch" > "$dir/src-$arch/tgoat"
		local files=(tgoat)
		if [[ -n "$extra" && $arch == amd64 ]]; then
			echo x > "$dir/src-$arch/$extra"
			files+=("$extra")
		fi
		tar -czf "$dir/tgoat-$version-linux-$arch.tar.gz" -C "$dir/src-$arch" "${files[@]}"
		rm -rf "$dir/src-$arch"
	done
	(cd "$dir" && sha256sum tgoat-*.tar.gz | sed 's/ \*/  /' > checksums.txt)
	sign "$dir"
}

sign() {
	openssl pkeyutl -sign -inkey "$work/test.key" -rawin -in "$1/checksums.txt" -out "$1/sig.bin"
	base64 -w0 "$1/sig.bin" > "$1/checksums.txt.sig"
	echo >> "$1/checksums.txt.sig"
	rm "$1/sig.bin"
}

run() { bash "$here/verify-release.sh" "$1" "$version" "$work/test.pub" "${2:-$key_sha}" "$1/out" >/dev/null 2>&1; }

passed=0
expect() { # expect <pass|fail> <what> <folder> [key sha]
	local want=$1 what=$2
	shift 2
	if run "$@"; then got=pass; else got=fail; fi
	if [[ $got != "$want" ]]; then
		echo "FAIL: $what: $got, expected $want" >&2
		exit 1
	fi
	passed=$((passed + 1))
}

make_release "$work/good"
expect pass "a good release" "$work/good"
[[ $(cat "$work/good/out/linux_arm64/tgoat") == "program arm64" ]] || { echo "FAIL: wrong program extracted" >&2; exit 1; }
for f in config data log; do
	[[ -d "$work/good/out/folders/$f" && -z $(ls -A "$work/good/out/folders/$f") ]] || { echo "FAIL: no empty folder $f" >&2; exit 1; }
done

expect fail "another key" "$work/good" "0000000000000000000000000000000000000000000000000000000000000000"

make_release "$work/tampered"
printf 'evil\n' | gzip > "$work/tampered/tgoat-$version-linux-arm64.tar.gz"
expect fail "an archive changed after signing" "$work/tampered"
[[ ! -e "$work/tampered/out" ]] || { echo "FAIL: a refused release left files to build from" >&2; exit 1; }

make_release "$work/badsig"
printf '%064d  tgoat-%s-linux-amd64.tar.gz\n' 0 "$version" >> "$work/badsig/checksums.txt"
expect fail "a list changed after signing" "$work/badsig"

make_release "$work/twice"
grep amd64 "$work/twice/checksums.txt" > "$work/twice/again"
cat "$work/twice/again" >> "$work/twice/checksums.txt"
sign "$work/twice"
expect fail "an archive listed twice" "$work/twice"

make_release "$work/missing"
grep -v arm64 "$work/missing/checksums.txt" > "$work/missing/c" && mv "$work/missing/c" "$work/missing/checksums.txt"
sign "$work/missing"
expect fail "an archive not listed" "$work/missing"

make_release "$work/extra" README.txt
expect fail "an archive with another file" "$work/extra"

make_release "$work/nosig"
rm "$work/nosig/checksums.txt.sig"
expect fail "no signature" "$work/nosig"

echo "verify-release.sh: $passed cases passed."
