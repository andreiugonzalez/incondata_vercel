// fileIcons.js
import { FaFileWord, FaFileExcel, FaFilePowerpoint, FaFilePdf, FaFileImage, FaFileArchive, FaFileCode, FaFileVideo, FaFileAudio, FaFileAlt } from 'react-icons/fa';

export const getFileIcon = (fileExtension) => {
    switch (fileExtension.toLowerCase()) {
        case 'doc':
        case 'docx':
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return <FaFileWord size={32} className="text-blue-600" />;
        case 'xls':
        case 'xlsx':
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            return <FaFileExcel size={32} className="text-green-600" />;
        case 'ppt':
        case 'pptx':
        case 'application/vnd.ms-powerpoint':
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
            return <FaFilePowerpoint size={32} className="text-orange-600" />;
        case 'pdf':
        case 'application/pdf':
            return <FaFilePdf size={32} className="text-red-600" />;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'image/jpeg':
        case 'image/png':
        case 'image/gif':
            return <FaFileImage size={32} className="text-yellow-600" />;
        case 'zip':
        case 'rar':
        case 'application/zip':
        case 'application/x-rar-compressed':
            return <FaFileArchive size={32} className="text-purple-600" />;
        case 'js':
        case 'html':
        case 'css':
        case 'application/javascript':
        case 'text/html':
        case 'text/css':
            return <FaFileCode size={32} className="text-indigo-600" />;
        case 'mp4':
        case 'avi':
        case 'video/mp4':
        case 'video/x-msvideo':
            return <FaFileVideo size={32} className="text-blue-600" />;
        case 'mp3':
        case 'wav':
        case 'audio/mpeg':
        case 'audio/wav':
            return <FaFileAudio size={32} className="text-green-600" />;
        default:
            return <FaFileAlt size={32} className="text-teal-600" />;
    }
};
