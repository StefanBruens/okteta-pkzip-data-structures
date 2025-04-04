# PKZip data structure decoder for Okteta

## Description
The structure decoder supports analysing Zip files, as documented in the PKWARE [APPNOTE](https://support.pkware.com/pkzip/application-note-archives).

It has support for the most common descriptor headers, notably including `Zip64 Extra Field`s and the `Zip64 End of Central Directory`.

It uses the Javascript structure definition syntax instead of the more basic XML structure definition format, as already the current features
of the decoder are hardly doable with the XML format. Future additions (see [Roadmap](#roadmap)) will make this even more evident.

## Installation
See the [Okteta Manual](https://docs.kde.org/trunk5/en/okteta/okteta/tools-structures.html#idm188) - Installing structure definitions.

## Usage
After installation and enabling the decoder, the "Structures" Panel on the right should show an "zip64" line.

Open a ZIP file (or any file which uses the ZIP format as container, like OpenDocument files), and select (click on) the first byte
of the file (should be a `P` in the ASCII column). The `zip64` `Type` changes to `struct Local File Header`. Expand it, and explore the decoded values.

## Roadmap

1. Add better decoding of Extra fields
   - [ ] Omit extra field when extra length is 0
   - [ ] Decode multiple extra fields
   - [ ] Add more extra field tags
2. Add missing Header types
   - [ ] add at least the identifiert (`PKnn`) to the enum
   - [ ] decode more types
3. [ ] Add missing compression enum values

## References
- [Userbase WIKI](https://userbase.kde.org/Okteta/Writing_structure_definitions)
- [Okteta Manual](https://docs.kde.org/trunk5/en/okteta/okteta/tools-structures.html)
- PKWARE [APPNOTE](https://support.pkware.com/pkzip/application-note-archives).

## Authors
Stefan Brüns

## License
GPL-3.0
