export const generateSlug = (title: string): string => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // Remove non-word characters (except spaces and hyphens)
        .replace(/[\s_-]+/g, "-")  // Replace spaces, underscores, and multiple hyphens with a single hyphen
        .replace(/^-+|-+$/g, "");   // Remove leading and trailing hyphens
};
