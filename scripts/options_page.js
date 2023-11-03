function process_page_whitelist(whitelist_str) // Returns 
{
    let whitelist = whitelist_str.split(',');
    for (let i = 0; i < whitelist.length; i++)
    {
        whitelist[i] = whitelist[i].trim();
    }
    return whitelist;
}

const saveOptions = () => {
    const display_type = document.getElementById('display_type').value;
    const auto_redirect = document.getElementById('auto_redirect').checked;
    const page_whitelist = process_page_whitelist(document.getElementById('page_whitelist').value);

    chrome.storage.sync.set(
        {
            display_type: display_type,
            auto_redirect: auto_redirect,
            page_whitelist: page_whitelist
        },
        () => {
            const status = document.getElementById('status');
            status.textContent = 'Options saved.';
            setTimeout(() => { status.textContent = ''; }, 750);
        }
    );
};

const restoreOptions = () => {
    chrome.storage.sync.get(
        {
            display_type: 'fullpage',
            auto_redirect: false,
            page_whitelist: []
        },
        (items) => {
            document.getElementById('display_type').value = items.display_type;
            document.getElementById('auto_redirect').checked = items.auto_redirect;
            document.getElementById('page_whitelist').value = items.page_whitelist.join(', ');
        }
    );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('submit').addEventListener('click', saveOptions);