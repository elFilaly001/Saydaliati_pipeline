import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { S3 } from "aws-sdk";
import { FileUpload } from "src/shared/interfaces/file.interface";
import { generateUniqueFileName } from "src/shared/utils/files.utils";


@Injectable()
export class S3Service {
    private readonly client: S3;
    private readonly logger = new Logger(S3Service.name);
    private readonly bucketName:string;

    constructor(private configService: ConfigService) {
        this.client = new S3({
            accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
            secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
            region: this.configService.get('AWS_REGION')
        });
        this.bucketName = this.configService.get('AWS_BUCKET_NAME');
    }

    // Function to upload file to S3 bucket with a unique file name and a specified folder

    async uploadFile(file: FileUpload, folder: string = ''): Promise<string> {
        try {
            const fileName = generateUniqueFileName(file.originalname);
            const key = `${folder}/${fileName}`;

            const uploadParams = { 
                Bucket: this.bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            }

            const result = await this.client.upload(uploadParams).promise();
            this.logger.log(`File uploaded successfully: ${result.Location}`);
            return result.Location;
        } catch (error) {
            this.logger.error(`Error uploading file: ${error.message}`);
            throw error;
        }
    }

    // Function to delete file from S3 bucket using the file url
    async deleteFile(fileUrl: string): Promise<void> {
        try {
          const key = this.extractKeyFromUrl(fileUrl);
          await this.client.deleteObject({
            Bucket: this.bucketName,
            Key: key,
          }).promise();
          
          this.logger.log(`File deleted successfully: ${key}`);
        } catch (error) {
          this.logger.error('Error deleting file from S3:', error);
          throw error;
        }
      }
    
      private extractKeyFromUrl(fileUrl: string): string {
        const urlParts = fileUrl.split('/');
        return urlParts.slice(3).join('/');
      }
    }