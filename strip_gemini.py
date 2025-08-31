#!/usr/bin/env python3

import argparse
import json
from pathlib import Path
import sys


def extract_md(data, exclude_user=False, include_thought=False):
    md_entries = []
    qst = 1
    for c in data.get("chunkedPrompt", {}).get("chunks", []):
        if c.get("role", "") == "user":
            md_entries.append(f"# Prompt {qst}")
            qst += 1
            if not exclude_user:
                md_entries.append(c.get("text", ""))
        else:
            if include_thought or not c.get("isThought", False):
                md_entries.append(c.get("text", ""))
    return "\n\n---\n\n".join(md_entries)


def process_chat_file(
    chat_file: Path, exclude_user: bool, include_thought: bool
):
    """
    Processes a single chat JSON file and converts it to Markdown.
    """
    if not chat_file.is_file():
        print(f"Error: Path is not a file: {chat_file}", file=sys.stderr)
        return False

    output_file = chat_file.with_suffix(".md")
    print(f'Processing "{chat_file.name}" -> "{output_file.name}"')
    try:
        with chat_file.open("r", encoding="utf-8") as fo:
            data = json.load(fo)
            md = extract_md(
                data, exclude_user=exclude_user, include_thought=include_thought
            )
        with output_file.open("w", encoding="utf-8") as fw:
            fw.write(md)
        return True
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in {chat_file.name}: {e}", file=sys.stderr)
        return False
    except IOError as e:
        print(
            f"Error: Could not read/write file {chat_file.name}: {e}",
            file=sys.stderr,
        )
        return False
    except Exception as e:
        print(
            f"An unexpected error occurred processing {chat_file.name}: {e}",
            file=sys.stderr,
        )
        return False


class MyParser(argparse.ArgumentParser):
    def error(self, message):
        sys.stderr.write("error: %s\n" % message)
        self.print_help()
        sys.exit(2)


def main():
    parser = MyParser(
        description=(
            "Convert Gemini chat JSON files to Markdown (.md) files. "
            "Provide either a path to a single file or a directory "
            "containing chat files."
        ),
        formatter_class=argparse.RawTextHelpFormatter,
    )
    parser.add_argument(
        "path",
        type=Path,
        help="Path to a single .json chat file, or a directory containing .json chat files.\n"
        "If a directory is provided, all .json files within it will be processed.",
    )
    parser.add_argument(
        "--exclude-user",
        action="store_true",
        help="Exclude user messages from the output Markdown.",
    )
    parser.add_argument(
        "--include-thought",
        action="store_true",
        help="Include internal thought entries from the assistant.",
    )
    args = parser.parse_args()

    input_path = args.path
    processed_count = 0
    skipped_count = 0

    if input_path.is_file():
        if process_chat_file(
            input_path,
            exclude_user=args.exclude_user,
            include_thought=args.include_thought,
        ):
            processed_count += 1
        else:
            skipped_count += 1
    elif input_path.is_dir():
        print(f"Searching for files in directory: {input_path}")
        chat_files = sorted([f for f in input_path.glob("*") if f.is_file()])
        print(chat_files)

        if not chat_files:
            print(f"No files found in {input_path}")
            sys.exit(0)  # Exit gracefully if no files found

        for chat_file in chat_files:
            if process_chat_file(
                chat_file,
                exclude_user=args.exclude_user,
                include_thought=args.include_thought,
            ):
                processed_count += 1
            else:
                skipped_count += 1
    else:
        print(
            f"Error: Provided path '{input_path}' is neither a file nor a directory.",
            file=sys.stderr,
        )
        sys.exit(1)

    print("\n--- Summary ---")
    print(f"Total files processed successfully: {processed_count}")
    if skipped_count > 0:
        print(
            f"Total files skipped or failed: {skipped_count}", file=sys.stderr
        )
        sys.exit(1)
    else:
        print("All specified files processed successfully.")


if __name__ == "__main__":
    main()
