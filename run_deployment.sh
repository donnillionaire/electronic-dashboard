

#!/usr/bin/env bash
set -Eeuo pipefail

# -----------------------------
# Config
# -----------------------------
IMAGE_NAME="dashboard-image-elec"
CONTAINER_NAME="dashboard-container-elec"
DOCKERFILE_DIR="."
TAIL_LOGS=true

EXTERNAL_PORT=3213     # access on host
CONTAINER_PORT=80      # nginx listens on 80 inside container
RESTART_POLICY="unless-stopped"

# Git
DO_GIT_PULL=true

# -----------------------------
# Helpers
# -----------------------------
log()  { echo "**** $*"; }
warn() { echo "!!!! $*" >&2; }
die()  { echo "#### ERROR: $*" >&2; exit 1; }

on_error() {
  local exit_code=$?
  warn "Script failed (exit code: $exit_code) at line $1: $2"
  exit "$exit_code"
}
trap 'on_error "$LINENO" "$BASH_COMMAND"' ERR

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

# -----------------------------
# Preconditions
# -----------------------------
require_cmd docker
if [[ "${DO_GIT_PULL}" == "true" ]]; then
  require_cmd git
fi

# Move to script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# -----------------------------
# Git pull (optional)
# -----------------------------
if [[ "${DO_GIT_PULL}" == "true" ]]; then
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    log "Git repo detected."

    # If there are uncommitted changes, skip pulling to avoid conflicts
    if [[ -n "$(git status --porcelain)" ]]; then
      warn "Uncommitted changes detected. Skipping 'git pull' to avoid conflicts."
    else
      # Ensure we have an upstream (origin/main, etc.)
      if git rev-parse --abbrev-ref --symbolic-full-name @{u} >/dev/null 2>&1; then
        CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
        log "Pulling latest changes for branch: ${CURRENT_BRANCH}"
        git pull --ff-only
        log "Git pull complete."
      else
        warn "No upstream tracking branch set. Skipping 'git pull'. (Set with: git branch --set-upstream-to=origin/<branch>)"
      fi
    fi
  else
    warn "Not a git repository. Skipping 'git pull'."
  fi
fi

# -----------------------------
# Stop/remove old container
# -----------------------------
log "Stopping and removing existing container (if any): ${CONTAINER_NAME}"
if docker ps -a --format '{{.Names}}' | grep -qx "${CONTAINER_NAME}"; then
  docker rm -f "${CONTAINER_NAME}" >/dev/null
  log "Old container removed."
else
  log "No existing container found."
fi

# -----------------------------
# Build image
# -----------------------------
log "Building Docker image: ${IMAGE_NAME}"
docker build -t "${IMAGE_NAME}" "${DOCKERFILE_DIR}"
log "Image build complete."

# -----------------------------
# Run container (correct port mapping)
# -----------------------------
log "Starting container: ${CONTAINER_NAME}"
log "Access URL: http://localhost:${EXTERNAL_PORT}"

docker run -d \
  --name "${CONTAINER_NAME}" \
  --restart "${RESTART_POLICY}" \
  -p "${EXTERNAL_PORT}:${CONTAINER_PORT}" \
  "${IMAGE_NAME}" >/dev/null

log "Container started successfully ✅"

# -----------------------------
# Quick status + health check
# -----------------------------
log "Container status:"
docker ps --filter "name=${CONTAINER_NAME}"

log "Quick HTTP check:"
curl -I "http://localhost:${EXTERNAL_PORT}" || warn "HTTP check failed"

# -----------------------------
# Tail logs (optional)
# -----------------------------
if [[ "${TAIL_LOGS}" == "true" ]]; then
  log "Tailing logs (Ctrl+C to stop)..."
  docker logs -f "${CONTAINER_NAME}"
fi
