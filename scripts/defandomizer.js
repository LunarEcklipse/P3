
class DefandomizerSettings // Handles user settings
{
    static load_user_settings()
    {

    }   
    
    static save_user_settings()
    {

    }

    constructor(display_type, auto_redirect, page_whitelist)
    {
        if (display_type === undefined || display_type === null)
        {
            display_type = "fullpage";
        }
        else if (display_type !== "fullpage" && display_type !== "popup" && display_type !== "none")
        {
            Logger.warn(`Invalid display type ${display_type}. Defaulting to fullpage.`);
            display_type = "fullpage";
        }
        else
        {
            this.display_type = display_type;
        }
        if (typeof(auto_redirect) !== "boolean")
        {
            Logger.warn(`Invalid auto_redirect type (Was "${typeof(auto_redirect)}", must be "boolean"). Defaulting to false.`);
            this.auto_redirect = false;
        }
        else
        {
            this.auto_redirect = auto_redirect;
        }
        if (typeof(page_whitelist) !== "array")
        {
            Logger.warn(`Invalid page_whitelist type (Was "${typeof(page_whitelist)}", must be "array"). Defaulting to empty array.`);
            this.page_whitelist = [];
        }
        else
        {
            this.page_whitelist = page_whitelist;
        }
    }
}

class Logger // Simple logging class to make it easier to identify logs made by this extension. Just appends "Defandomizer | " to the beginning of the message.
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
        if (SiteChecker.check_if_url_is_fandom_wiki(url))
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
        let wiki = SiteChecker.capture_fandom_wiki_from_url(page_url);
        if (wiki)
        {
            let data = site_redirects;
            for (let i = 0; i < data.length; i++)
            {
                if (data[i]["fwiki"] === wiki)
                {
                    console.log(data[i]["alt"]);
                    return data[i]["alt"];
                }
            }
        }
        return null;
    }
}

var site_redirects = null;
var page_html = "";
var page_head = "";
var page_body = "";
var new_page_head = "";
var new_page_body = "";
var accept_page_changes = true;
var page_observer = undefined;

class PageReplacer
{
    static replace_page(alternate_url)
    {
        page_observer = new MutationObserver(PageReplacer.reset_page_on_change);
        page_html = document.documentElement.innerHTML;
        page_head = document.head.innerHTML;
        page_body = document.body.innerHTML;
        document.head.innerHTML = "";
        document.body.innerHTML = "";
        let new_title = document.createElement("title");
        new_title.innerText = "Defandomizer has Interrupted this Page.";
        document.head.appendChild(new_title);
        let new_meta = document.createElement("meta");
        new_meta.name = "viewport";
        new_meta.content = "width=device-width, initial-scale=1.0";
        document.head.appendChild(new_meta);
        let new_favicon = document.createElement("link");
        new_favicon.rel = "icon";
        new_favicon.href = chrome.runtime.getURL("img/defandomizer_16.png");
        document.head.appendChild(new_favicon);
        let new_charset = document.createElement("meta");
        new_charset.charset = "utf-8";
        document.head.appendChild(new_charset);
        let new_stylesheet = document.createElement("link");
        new_stylesheet.rel = "stylesheet";
        new_stylesheet.type = "text/css";
        new_stylesheet.href = chrome.runtime.getURL("css/defandomizer_style.css");
        document.head.appendChild(new_stylesheet);
        // Add padding to body
        let new_img = document.createElement("img");
        new_img.src = chrome.runtime.getURL("img/defandomizer_256.png");
        document.body.appendChild(new_img);
        let new_header = document.createElement("h1");
        new_header.innerText = "Defandomizer has Interrupted this Page.";
        let new_p1 = document.createElement("p");
        new_p1.innerText = "This wiki is run by a company known as Fandom.";
        let new_p2 = document.createElement("p");
        new_p2.innerText = "If you don't know already, Fandom is a company that hosts various pop culture wikis, but puts profit over people.";
        let new_p3 = document.createElement("p");
        new_p3.innerText = "The company routinely buys out other, independent platforms, and then forces changes on their sites that degrade the reader experience and take away the control of the editors. Essentially, their entire business model is based on monetizing things people make for free. Wiki editors are not compensated in any way, shape, or form.";
        document.body.appendChild(new_header);
        document.body.appendChild(new_p1);
        document.body.appendChild(new_p2);
        document.body.appendChild(new_p3);
        if (alternate_url)
        {
            let new_p4 = document.createElement("p");
            new_p4.innerText = "Fortunately, this wiki's community has already moved elsewhere.";
            let new_btn = document.createElement("button");
            new_btn.id = "defandomizer_continue_to_new_wiki_btn";
            new_btn.innerText = "Continue to the New Wiki";
            new_btn.addEventListener("click", function() {
                accept_page_changes = true;
                page_observer.disconnect();
                document.head.innerHTML = page_head;
                document.body.innerHTML = page_body;
                window.location.href = alternate_url;
            });
            document.body.appendChild(new_p4);
            document.body.appendChild(new_btn);
        }
        else
        {
            let new_p4 = document.createElement("p");
            new_p4.innerText = "Please consider searching for alternative communities for this wiki. You can find them on communities such as wiki.gg.";
            document.body.appendChild(new_p4);
        }
        let return_button = document.createElement("button");
        return_button.innerText = "Continue to Fandom Anyways";
        return_button.id = "defandomizer_return_to_fandom_btn";
        return_button.addEventListener("click", function() {
            accept_page_changes = true;
            page_observer.disconnect();
            document.head.innerHTML = page_head;
            document.body.innerHTML = page_body;
        });
        console.dir(return_button);
        document.body.appendChild(return_button);
        new_page_head = document.head.innerHTML;
        new_page_body = document.body.innerHTML;
        
        console.log("Button no click?");
        accept_page_changes = false;

        /*(async function() {
            Logger.log("Activating observer.");
            page_observer.observe(document.documentElement, {childList: true, subtree: true});
        })();   */
    }
    
    static reset_page_on_change(event) // Called when the page is changed and 
    {
        (async function() {
            if (!accept_page_changes)
        {
            Logger.log("Page change by site rejected.");
            page_observer.disconnect(); // This prevents the extension from literally crashing the page hopefully
            document.head.innerHTML = new_page_head;
            document.body.innerHTML = new_page_body;
            page_observer.observe(document.documentElement, {childList: true, subtree: true});
        }
        })();
    }
}

async function load_site_data()
{
    let response = await fetch(chrome.runtime.getURL("data/sites.json"));
    let data = await response.json();
    return data;
}

Logger.log("Fandomizer is now running.");
window.addEventListener("error", (event) => {
    console.log(event.source);
});
(async function() {
    site_redirects = await load_site_data();
    Logger.log("Loaded site data.");
    page_html = document.body.innerHTML;
    Logger.log("Loaded page body.");

    let alternate_url = null;

    if (SiteChecker.check_if_url_is_fandom_wiki(location.href)) // Get an alternate URL if one exists in the data.
    {
        alternate_url = SiteChecker.search_data_for_existing_redirect(location.href);
        if (alternate_url)
        {
            Logger.log("Found alternate URL: " + alternate_url);
        }
        page_html = document.documentElement.innerHTML;
        PageReplacer.replace_page(alternate_url);
    }
})();
