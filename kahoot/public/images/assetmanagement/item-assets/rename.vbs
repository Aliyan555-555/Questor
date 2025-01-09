Dim fso, folder, files, file, i
Set fso = CreateObject("Scripting.FileSystemObject")

' Set the folder path where your SVG files are located
folderPath = "C:\Users\MeteoricHPiseven\Desktop\Aliyan\kahoot\kahoot\public\images\assetmanagement\item-assets" ' <-- Change this path

' Get the folder object
Set folder = fso.GetFolder(folderPath)

' Get all the SVG files in the folder
Set files = folder.Files

' Initialize counter
i = 1

' Loop through each file in the folder
For Each file In files
    If LCase(fso.GetExtensionName(file.Name)) = "svg" Then
        ' Rename the file
        file.Name = i & ".svg"
        i = i + 1
    End If
Next

' Cleanup
Set files = Nothing
Set folder = Nothing
Set fso = Nothing
