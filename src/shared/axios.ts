export const Axios = async (path: string, params: any = "") => {
  const res = await fetch(`${import.meta.env.VITE_API_PROTOCOL}://${import.meta.env.VITE_API_DOMAIN}/${path}?${params}`, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
    },
  });

  return res.json();
};