#!/usr/bin/env bash
# Checks a downloaded TGoat release, then puts its two Linux programs where
# the Dockerfile takes them (<out>/linux_<arch>/tgoat), with the empty volume
# folders (<out>/folders/{config,data,log}). Nothing is used before the
# signature and the checksums check out.
#
#   verify-release.sh <release folder> <version> <public key> <key SHA-256> <out folder>
#
# The release folder holds checksums.txt, checksums.txt.sig and
# tgoat-<version>-linux-{amd64,arm64}.tar.gz, as on the GitHub release page.
# Needs bash, OpenSSL 3, sha256sum, tar and awk. Exits non-zero on any doubt.
set -euo pipefail

if [[ $# -ne 5 ]]; then
	echo "usage: $0 <release folder> <version> <public key> <key SHA-256> <out folder>" >&2
	exit 2
fi
release=$1 version=$2 key=$3 key_sha=$4 out=$5

fail() {
	echo "verify-release: $*" >&2
	exit 1
}

[[ "$version" =~ ^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(-[0-9A-Za-z.-]+)?$ ]] ||
	fail "$version is not a TGoat version"

# 1. The key is the TGoat release key (the one tgoat version prints).
fp=$(openssl pkey -pubin -in "$key" -outform DER | sha256sum | awk '{print $1}')
[[ "$fp" == "$key_sha" ]] || fail "$key is not the TGoat release key (SHA-256 $fp)"

# 2. The signature of checksums.txt.
base64 -d "$release/checksums.txt.sig" > "$release/checksums.sig.bin" || fail "checksums.txt.sig is not base64"
openssl pkeyutl -verify -pubin -inkey "$key" -rawin -in "$release/checksums.txt" -sigfile "$release/checksums.sig.bin" ||
	fail "the signature of checksums.txt does not verify: do not use this release"

# 3. Each archive is listed exactly once, and has that checksum.
for arch in amd64 arm64; do
	name="tgoat-$version-linux-$arch.tar.gz"
	lines=$(awk -v n="$name" '($2 == n || $2 == "*" n) && NF == 2 && $1 ~ /^[0-9a-f]+$/ && length($1) == 64' "$release/checksums.txt")
	[[ -n "$lines" && $(wc -l <<<"$lines") -eq 1 ]] || fail "checksums.txt must list $name exactly once"
	(cd "$release" && sha256sum --strict -c - <<<"$lines") || fail "$name does not have its signed checksum"
done

# 4. Each archive holds the program tgoat alone, a plain file.
for arch in amd64 arm64; do
	archive="$release/tgoat-$version-linux-$arch.tar.gz"
	listing=$(tar -tvzf "$archive")
	[[ $(wc -l <<<"$listing") -eq 1 && "$listing" == -* && $(tar -tzf "$archive") == "tgoat" ]] ||
		fail "$archive must hold the program tgoat only"
	dir="$out/linux_$arch"
	rm -rf "$dir"
	mkdir -p "$dir"
	tar -xzf "$archive" -C "$dir" --no-same-owner --no-same-permissions tgoat
	chmod 0755 "$dir/tgoat"
done

# 5. The empty folders of the volumes (owned by the image's user at build).
rm -rf "$out/folders"
mkdir -p "$out/folders/config" "$out/folders/data" "$out/folders/log"

echo "TGoat $version: signature and checksums verified, programs in $out."
