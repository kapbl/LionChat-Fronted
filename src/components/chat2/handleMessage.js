
async function handleFileSelect(event) {
    const file = event.target.files[0]
    if (!file) return
    let contentType = 1
    const reader = new FileReader()
    reader.onload = async (e) => {
        const fileBuffer = new Uint8Array(e.target.result)
        const fileName = file.name
        console.log(file.type)
        // 根据文件类型设置contentType
        if (file.type === 'application/pdf') {
            contentType = 2
        } else if (file.type.startsWith('image/')) {
            contentType = 3
        } else if (file.type.startsWith('video/')) {
            contentType = 5
        }
        sendFileMessage({
            fileName,
            fileBuffer,
            contentType,
            fileSuffix: fileName.split('.').pop()
        })
    }
    reader.readAsArrayBuffer(file)
}