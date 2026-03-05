export function getAuthToken() {
  return (
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("auth_token")
  );
}

export function isAuthenticated() {
  return !!getAuthToken();
}
