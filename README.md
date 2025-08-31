# StripGemini

A tool to convert Google AI Studio chat files (json) to Markdown (.md) .
This can be done either through a simple client-side web page or a Python script.

## Web Interface (Client-Side)

A hosted page is available at [StripGemini](https://stripgemini.ayghri.com).

Conversion happens on the browser (client-side), nothing is logged or tracked.

### Local use

1.  Open `index.html` in your web browser.
2.  **Select Files**: Click on "Select Gemini Chat JSON Files" and choose one or more chat files you've downloaded from AI Studio.
3.  **Set Options**:
    *   **Exclude User Prompts**: Check this if you only want the AI's responses in the output.
    *   **Include Thought Blocks**: Check this to include the AI's internal "chain of thought" blocks.
4.  **Convert**: Click the "Convert to Markdown" button.
5.  **Download**: Your browser will automatically download the converted `.md` files.

## Python Script (Command-Line)

The Python script provides a command-line interface to convert files locally.

### Requirements

- Python 3.x

### How to Use

1.  Clone this repository or download `strip_gemini.py`.
2.  Open your terminal and navigate to the directory containing the script.

#### Convert a single file:

```bash
python strip_gemini.py /path/to/your/chat_file
```

#### Convert all files in a directory:

```bash
python strip_gemini.py /path/to/your/directory/
```

### Options

-   `--exclude-user`: Exclude user messages from the output Markdown.
-   `--include-thought`: Include internal thought entries from the assistant.

#### Example with options:

```bash
python strip_gemini.py --exclude-user --include-thought /path/to/your/chat_file
```

## How to get your Gemini Chat files

1.  Go to your [AI Studio History](https://aistudio.google.com/library)
2.  "Open in Drive"
3.  Download the chat/chats

## License
**The license does not cover the logos**

This code in this project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Feel free to open an issue or submit a pull request if you have any suggestions or find any bugs.
