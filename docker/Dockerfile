# syntax=docker/dockerfile:1@sha256:4edf897a3ffa55b89f906fc8cc78afdb3f1834cc9c7083565e611a8a7d5fe99e
#
# TGoat image, built from the signed release archives only, never from source.
# docker/verify-release.sh checks the signature and the checksums, then puts
# the two Linux programs and the empty volume folders here:
#
#   docker/dist/linux_amd64/tgoat
#   docker/dist/linux_arm64/tgoat
#   docker/dist/folders/{config,data,log}/
#
# Build by hand, from the docker/ folder, after running that script:
#   docker buildx build --platform linux/amd64,linux/arm64 -t tgoat .
#
# Every image input is pinned by digest (the tag is in the comment). To
# refresh a pin: docker buildx imagetools inspect <image>:<tag>, take the
# "Digest:" line, and update it here, in docker-compose.yml and in
# .github/workflows/docker.yml (or merge the Dependabot pull request).

# A static base: no shell, no package manager. It holds the CA certificates
# (TLS to Gameforge and GitHub) and the time zone data (TZ).
# gcr.io/distroless/static-debian12:latest
FROM gcr.io/distroless/static-debian12@sha256:d75cdd72874d4790092fcb1b058493ecf6bb5bf2b2b897045b00ff01d91843f2

ARG TARGETARCH
ARG VERSION=unknown

LABEL org.opencontainers.image.title="TGoat" \
      org.opencontainers.image.description="TGoat, a bot that plays your OGame accounts, with its web interface." \
      org.opencontainers.image.source="https://github.com/ronnie32/tgoat" \
      org.opencontainers.image.url="https://ronnie32.github.io/tgoat/start.html#docker" \
      org.opencontainers.image.version="${VERSION}"

# TGoat keeps config/, data/ and log/ next to its program: /app.
WORKDIR /app
# The empty volume folders, owned by the user TGoat runs as (/app itself
# stays root's).
COPY --chown=1000:1000 dist/folders/ /app/
# The program belongs to root: TGoat cannot replace itself. A new version
# comes with a new image.
COPY --chmod=0755 dist/linux_${TARGETARCH}/tgoat /app/tgoat

# TGOAT_CONTAINER=1: the web interface listens on 0.0.0.0 (so it asks for a
# password), and updates are announced, never installed.
ENV TGOAT_CONTAINER=1
# tgoat and ./tgoat both work in docker compose exec.
ENV PATH=/app:/usr/local/bin:/usr/bin:/bin

USER 1000:1000
VOLUME ["/app/config", "/app/data", "/app/log"]
# 9090: web interface. 9091: game proxy (the OGame page).
EXPOSE 9090 9091

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 CMD ["/app/tgoat", "health"]

ENTRYPOINT ["/app/tgoat"]
CMD ["run"]
