function validateSignature() {
    var _P = this["P"];
    var _K = this["K"];
    _P.valid = _P.value.uint8 == 0x50; // 'P'
    _K.valid = _K.value.uint8 == 0x4b; // 'K'
}

function init() {

    var signatureEnumValues = {
        "0201 - Central Cirectory File Header" : 0x201,
        "0403 - Local File Header" : 0x403,
        "0605 - End Of Central Directory" : 0x605,
        "0606 - Zip64 End Of Central Directory Record" : 0x606,
        "0607 - Zip64 End Of Central Directory Locator" : 0x706,
        "0807 - Data Descriptor" : 0x807,
    };
    var compressionMethodEnumValues = {
        "Store" : 0,
        "Deflate" : 8,
    };
    var compressionMethod = enumeration("CompressionMethod", uint16(), compressionMethodEnumValues);

    var signature = struct({
        P : char(),
        K : char(),
        ID : enumeration("SignatureEnum", uint16(), signatureEnumValues),
    }).setValidation(validateSignature);

    var extraZip64ExtendedInfo = alternative(
        function() { return this.Tag.uint16 == 0x0001; },
        {
            Uncompressed_Size : uint64(),
            Compressed_Size : uint64(),
            Local_Header_Offset : uint64(),
        }
    );
    var extraField = taggedUnion(
        { Tag : uint16(), Size : uint16() },
        [ extraZip64ExtendedInfo ]
    );

    var centralDirectoryFileHeader = alternative(
        function() { return this.Signature.ID.uint16 == 0x201; },
        {
            Version_Created : uint16(),
            Version_Needed : uint16(),
            Gpf : uint16(),
            Compression_Method : compressionMethod,
            Last_Modification_Time : uint16(),
            Last_Modification_Date : uint16(),
            Crc32 : uint32(),
            Compressed_Size : uint32(),
            Uncompressed_Size : uint32(),
            Filename_Length : uint16(),
            Extra_Length : uint16(),
            Comment_Length : uint16(),
            Disk_Number : uint16(),
            Internal_Attributes : uint16(),
            External_Attributes : uint32(),
            Local_Header_Offset : uint32(),
            Filename : array(char(), function(cdfh) { return cdfh.Filename_Length.uint16; }),
            Extra : extraField,
            // Extra : array(char(), function(cdfh) { return cdfh.Extra_Length.uint16; }),
            Comment : array(char(), function(cdfh) { return cdfh.Comment_Length.uint16; })
        },
        "Central Directory File Header"
    );
    var localFileHeader = alternative(
        function() { return this.Signature.ID.uint16 == 0x403; },
        {
            Version_Needed : uint16(),
            Gpf : uint16(),
            Compression_Method : compressionMethod,
            Last_Modification_Time : uint16(),
            Last_Modification_Date : uint16(),
            Crc32 : uint32(),
            Compressed_Size : uint32(),
            Uncompressed_Size : uint32(),
            Filename_Length : uint16(),
            Extra_Length : uint16(),
            Filename : array(char(), function(lfh) { return lfh.Filename_Length.uint16; }),
            Extra : extraField
        },
        "Local File Header"
    );
    var endOfCentralDirectory = alternative(
        function() { return this.Signature.ID.uint16 == 0x605; },
        {
            Disk_Number : uint16(),
            Central_Directory_Disk_Number : uint16(),
            Entry_Count_This_Disk : uint16(),
            Entry_Count_Total : uint16(),
            Central_Directory_Size : uint32(),
            Central_Directory_Offset : uint32(),
            Comment_Length : uint16(),
            Comment : array(char(), function(eocd) { return eocd.Comment_Length.uint16; })
        },
        "End Of Central Directory"
    );
    var zip64EndOfCentralDirectoryRecord = alternative(
        function() { return this.Signature.ID.uint16 == 0x606; },
        {
            Central_Directory_Size : uint64(),
            Version_Created : uint16(),
            Version_Needed : uint16(),
            Disk_Number : uint32(),
            Central_Directory_Disk_Number : uint32(),
            Entry_Count_This_Disk : uint64(),
            Entry_Count_Total : uint64(),
            Central_Directory_Size : uint64(),
            Central_Directory_Offset : uint64(),
            Extensible_Data_Sector : array(char(), 0)
        },
        "Zip64 End Of Central Directory Record"
    );
    var zip64EndOfCentralDirectoryLocator = alternative(
        function() { return this.Signature.ID.uint16 == 0x607; },
        {
            End_Of_Central_Directory_Disk_Number : uint32(),
            End_Of_Central_Directory_Offset : uint64(),
            Central_Directory_Disk_Count : uint32()
        },
        "Zip64 End Of Central Directory Locator"
    );
    var dataDescriptor = alternative(
        function() { return this.Signature.ID.uint16 == 0x807; },
        {
            Crc32 : uint32(),
            CompressedSize : uint32(),
        },
        "Data Descriptor"
    );

    var headers = taggedUnion(
        { Signature : signature },
        [
            localFileHeader,
            centralDirectoryFileHeader,
            endOfCentralDirectory,
            zip64EndOfCentralDirectoryRecord,
            zip64EndOfCentralDirectoryLocator,
            dataDescriptor
        ]
    );
    return headers;
}
