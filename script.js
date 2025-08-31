document.addEventListener('DOMContentLoaded', () => {
    const jsonInput = document.getElementById('jsonInput');
    const excludeUserCheckbox = document.getElementById('excludeUser');
    const includeThoughtCheckbox = document.getElementById('includeThought');
    const convertButton = document.getElementById('convertButton');
    const statusDiv = document.getElementById('status');
    const downloadsInfoDiv = document.getElementById('downloads-info');

    /**
     * Reflects  the Python logic
     * @param {object} data - The parsed JSON data from a Gemini chat file.
     * @param {boolean} excludeUser - Whether to exclude user prompts.
     * @param {boolean} includeThought - Whether to include AI thought blocks.
     * @returns {string} The formatted Markdown string.
     */
    function extractMd(data, excludeUser = false, includeThought = false) {
        const mdEntries = [];
        let qst = 1;
        const chunks = data?.chunkedPrompt?.chunks || [];

        for (const c of chunks) {
            if (c.role === "user") {
                mdEntries.push(`# Question ${qst}`);
                qst += 1;
                if (!excludeUser) {
                    mdEntries.push(c.text);
                }
            } else {
                if (includeThought || !c.isThought) {
                    mdEntries.push(c.text);
                }
            }
        }
        return mdEntries.join("\n\n---\n\n");
    }

    /**
     * Reads a File object as plain text.
     * @param {File} file - The file to read.
     * @returns {Promise<string>} A promise that resolves with the file content as text.
     */
    function readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result);
            reader.onerror = (event) => reject(event.target.error);
            reader.readAsText(file);
        });
    }

    /**
     * Creates a downloadable Blob for the given content.
     * @param {string} content - The text content to download.
     * @param {string} filename - The desired filename for the download.
     */
    function downloadMarkdownFile(content, filename) {
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    convertButton.addEventListener('click', async () => {
        const files = jsonInput.files;
        if (files.length === 0) {
            statusDiv.textContent = 'Please select one or more JSON files to convert.';
            statusDiv.style.color = 'orange';
            downloadsInfoDiv.textContent = '';
            return;
        }

        statusDiv.textContent = `Processing ${files.length} file(s)...`;
        statusDiv.style.color = '#007bff';
        downloadsInfoDiv.textContent = '';

        const excludeUser = excludeUserCheckbox.checked;
        const includeThought = includeThoughtCheckbox.checked;

        let successfulConversions = 0;
        let failedConversions = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            try {
                const fileContent = await readFileAsText(file);
                const jsonData = JSON.parse(fileContent);
                const markdown = extractMd(jsonData, excludeUser, includeThought);

                const originalFileName = file.name.replace(/\.json$/i, '');
                const outputFileName = `${originalFileName}.md`;

                downloadMarkdownFile(markdown, outputFileName);
                successfulConversions++;

            } catch (error) {
                console.error(`Error processing ${file.name}:`, error);
                downloadsInfoDiv.innerHTML += `<p class="error-item">Error converting "${file.name}": ${error.message}</p>`;
                failedConversions++;
            }
        }

        statusDiv.textContent = `Conversion complete! Successfully converted ${successfulConversions} file(s).`;
        statusDiv.style.color = successfulConversions > 0 ? 'green' : 'red';

        if (failedConversions > 0) {
            downloadsInfoDiv.innerHTML += `<p class="error-summary">Failed to convert ${failedConversions} file(s). Check console for details.</p>`;
            downloadsInfoDiv.style.color = 'red';
        } else {
            downloadsInfoDiv.textContent = 'All selected files converted successfully.';
            downloadsInfoDiv.style.color = 'green';
        }
    });
});
