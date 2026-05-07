import { google } from 'googleapis';
import { Readable } from 'stream';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

async function getDriveService() {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}'),
    scopes: SCOPES,
  });
  return google.drive({ version: 'v3', auth });
}

export async function getOrCreateFolderByPhone(phoneNumber: string) {
  try {
    const drive = await getDriveService();
    
    // Search for folder
    const response = await drive.files.list({
      q: `name = '${phoneNumber}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
    });

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    // Create folder if not exists
    const fileMetadata = {
      name: phoneNumber,
      mimeType: 'application/vnd.google-apps.folder',
    };

    const folder = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
    });

    return folder.data.id;
  } catch (error) {
    console.error('Error in Google Drive folder operation:', error);
    return null;
  }
}

export async function uploadToDrive(fileName: string, mimeType: string, buffer: Buffer, folderId: string) {
  try {
    const drive = await getDriveService();
    
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    const media = {
      mimeType: mimeType,
      body: Readable.from(buffer),
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    return file.data;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    return null;
  }
}
