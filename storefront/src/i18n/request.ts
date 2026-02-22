import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { getI18nOverrides } from "@/lib/data/content-blocks";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as typeof routing.locales[number])) {
    locale = routing.defaultLocale;
  }

  const staticMessages = (await import(`./messages/${locale}.json`)).default;

  // Merge translation overrides from Supabase (admin edits) on top of static JSON
  try {
    const overrides = await getI18nOverrides(locale);
    if (Object.keys(overrides).length > 0) {
      const merged = { ...staticMessages };
      for (const [namespace, keys] of Object.entries(overrides)) {
        if (merged[namespace] && typeof merged[namespace] === "object") {
          merged[namespace] = { ...merged[namespace], ...keys };
        }
      }
      return { locale, messages: merged };
    }
  } catch {
    // Fall through to static messages on error
  }

  return {
    locale,
    messages: staticMessages,
  };
});
