import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/update-pharmacy.dto';
import {S3Service} from  '../s3/s3.service';
import { JwtAuthGuard } from '@/auth/guards/auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';


@Controller('pharmacy')
export class PharmacyController {
  constructor(
    private readonly pharmacyService: PharmacyService,
    private readonly s3Service: S3Service
  ) {}

  @Post("/createPharmacy")
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createPharmacyDto: CreatePharmacyDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      const folder = 'pharmacies'; 
      const uploadedImageUrl = await this.s3Service.uploadFile(file, folder);
      console.log(uploadedImageUrl);
      createPharmacyDto.image = uploadedImageUrl; 
    }

   
    return this.pharmacyService.create(createPharmacyDto);
  }

  @Get()
  findAll() {
    return this.pharmacyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pharmacyService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  update(@Param('id') id: string, @Body() updatePharmacyDto: UpdatePharmacyDto) {
    return this.pharmacyService.update(id, updatePharmacyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.pharmacyService.remove(id);
  }
}
