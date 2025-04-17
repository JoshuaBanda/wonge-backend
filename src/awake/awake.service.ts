import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class AwakeService {
  private readonly logger = new Logger(AwakeService.name);

  constructor(private readonly httpService: HttpService) {}

  @Interval(60000) // every 2 minutes (in milliseconds)
  async callAnotherBackend() {
    try {
      const response$ = this.httpService.get('https://wonge-backend.onrender.com/awake');
      const response = await lastValueFrom(response$);
      this.logger.log('Data received:', response.data);
      console.log('request sent');
      // You can process or store the data here
    } catch (error) {
      this.logger.error('Failed to fetch data:', error.message);
    }
  }

  async recieveReqestFromAnotherBackEnd(){
    console.log('request recieved');
  }
}
