import { FirebaseService } from '@/firebase/firebase.service';
import { Injectable, NotFoundException, BadRequestException, UnauthorizedException, UseGuards } from '@nestjs/common';
import { FavoritDto } from './dto/favorit.dto';
import { AuthService } from '@/auth/auth.service';
import { JwtAuthGuard } from '@/auth/guards/auth.guard';


@Injectable()
export class FavoritService {

    constructor(
        private readonly firebaseService: FirebaseService,
        private readonly authService: AuthService,
    ) {}

    async addFavorit(favoritDto : FavoritDto , token: string): Promise<void> {
        try {

        const vltoken = token.split(' ')[1];
          
        const email = await this.authService.extractEmailFromToken(vltoken);
          const userRecord = await this.firebaseService.auth.getUserByEmail(email)
          .catch(() => {
            throw new NotFoundException('User Not Found');
          });
          const userRef = this.firebaseService.collection('users').doc(userRecord.uid);
          const userDoc = await userRef.get();

            const userData = userDoc.data();
            const currentFavorites = userData.favorites || [];

            if (!currentFavorites.includes(favoritDto.favorites)) {
                await userRef.update({
                    favorites: [...currentFavorites, favoritDto.favorites]
                });
            }else{
                throw new BadRequestException('Item already in favorites');
            }
        } catch (error) {
            throw new BadRequestException('Failed to add favorite: ' + error.message);
        }
    }

    async removeFavorit(favoritDto: FavoritDto , token: string): Promise<void> {
        try {
            const vltoken = token.split(' ')[1];
            const email = await this.authService.extractEmailFromToken(vltoken);
            const userRecord = await this.firebaseService.auth.getUserByEmail(email)
            .catch(() => {
              throw new NotFoundException('User Not Found');
            });
            const userRef = this.firebaseService.collection('users').doc(userRecord.uid);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                throw new NotFoundException('User not found');
            }

            const userData = userDoc.data().favorites;
            
            const currentFavorites = userData.favorites || [];

            if (userData.includes(favoritDto.favorites)) {
                await userRef.update({
                    favorites: currentFavorites.filter(id => id !== favoritDto.favorites)
                });
            }else{
                throw new BadRequestException('Item not in favorites');
            }
        } catch (error) {
            throw new BadRequestException('Failed to remove favorite: ' + error.message);
        }
    }

    async getFavorites(token: string): Promise<any> {
        const vltoken = token.split(' ')[1];
        const email = await this.authService.extractEmailFromToken(vltoken);
        const userRecord = await this.firebaseService.auth.getUserByEmail(email);
        const userRef = this.firebaseService.collection('users').doc(userRecord.uid);
        const userDoc = await userRef.get();
        const userData = userDoc.data();
        
        // Fetch additional data for each pharmacy favorite
        const favoritesData = await Promise.all(userData.favorites.map(async (pharmacyId) => {
            const pharmacyRef = this.firebaseService.collection('pharmacies').doc(pharmacyId);
            const pharmacyDoc = await pharmacyRef.get();
            return pharmacyDoc.data(); 
        }));

        return {favoritesData , pharmacyId: userData.favorites}; 
    }
}
