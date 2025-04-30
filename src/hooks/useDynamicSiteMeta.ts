import { useEffect } from "react";

type SiteMetaOptions = {
  title?: string;
  faviconUrl?: string;
};

const useDynamicSiteMeta = ({ title, faviconUrl }: SiteMetaOptions) => {
  console.log(title, faviconUrl);
  
  // Set page title
  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);

  // Set favicon
  useEffect(() => {
    if (!faviconUrl) return;

    let link = document.querySelector(
      "link[rel~='icon']"
    ) as HTMLLinkElement | null;

    if (link) {
      link.href = faviconUrl;
    } else {
      link = document.createElement("link");
      link.rel = "icon";
      link.href = faviconUrl;
      document.head.appendChild(link);
    }
  }, [faviconUrl]);
};

export default useDynamicSiteMeta;
