class Logger
{
    static log(message)
    {
        console.log("Defandomizer | " + message);
    }

    static warn(message)
    {
        console.warn("Defandomizer | " + message);
    }

    static error(message)
    {
        console.error("Defandomizer | " + message);
    }
}

class SiteChecker
{
    static check_if_url_is_fandom_wiki(url) // Returns true if the URL is a fandom wiki, else false
    {
        const re_patterns = [new RegExp("https?:\/\/([a-zA-Z0-9]+).fandom.com\/.*"), new RegExp("https?:\/\/www.([a-zA-Z0-9]+).fandom.com\/.*"), ];
        for (let i = 0; i < re_patterns.length; i++)
        {
            if (re_patterns[i].test(url))
            {
                return true;
            }
        }
        return false;
    }

    static capture_fandom_wiki_from_url(url)
    {
        // PATTERN: HTTP(S)://{WIKI_TITLE_HERE}.fandom.com/{WHATEVER}
        // PATTERN: HTTP(S)://www.{WIKI_TITLE_HERE}.fandom.com/{WHATEVER}
        const match_patterns = [new RegExp("https?:\/\/([a-zA-Z0-9]+).fandom.com\/.*"), new RegExp("https?:\/\/www.([a-zA-Z0-9]+).fandom.com\/.*"), ];
        if (check_if_url_is_fandom_wiki(url))
        {
            for (let i = 0; i < match_patterns.length; i++)
            {
                let match = match_patterns[i].exec(url);
                if (match)
                {
                    return match[1];
                }
            }
        }
        return null;
    }

    static search_data_for_existing_redirect(page_url) // Takes a URL, determines what wiki it is, and then checks if it exists in the data file
    {

    }
}

class PageReplacer
{
}

Logger.log("Fandomizer is now running.");
const site_redirects = chrome.runtime.getURL("data/sites.json");

var page_body = ""; // We store the page body here for later use.

if (logo)
{
    logo.remove();
}