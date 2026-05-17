import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);

  constructor(private readonly configService: ConfigService) {
    this._initializeFirebase();
  }

  /**
   * Initializes Firebase Admin SDK.
   * Safe to call multiple times — re-initializes only if needed.
   * This is critical on Vercel serverless where module lifecycle hooks
   * (OnModuleInit) may not run on every cold start, but the constructor always does.
   */
  private _initializeFirebase() {
    try {
      // If a default app already exists and has a valid credential, skip init.
      if (admin.apps.length > 0) {
        admin.app(); // will throw if the default app is broken
        return;
      }
    } catch {
      // Default app exists but is broken — delete it so we can re-initialize.
      this.logger.warn('Firebase default app was broken, re-initializing...');
      admin.apps.forEach((app) => app?.delete());
    }

    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn(
        'Firebase configuration is missing in environment variables. Push notifications will not work.',
      );
      return;
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });

    this.logger.log('Firebase Admin initialized successfully');
  }

  async sendPushNotification(
    tokens: string[],
    title: string,
    body: string,
    data?: { [key: string]: string },
  ) {
    if (!tokens || tokens.length === 0) {
      return null;
    }

    // Ensure Firebase is initialized before sending (guards against cold starts)
    this._initializeFirebase();

    const message: admin.messaging.MulticastMessage = {
      notification: {
        title,
        body,
      },
      tokens,
      data,
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      if (response.failureCount > 0) {
        this.logger.warn(`FCM: ${response.failureCount} of ${tokens.length} messages failed`);
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            this.logger.error(`FCM error for token[${idx}]: ${resp.error?.message}`);
          }
        });
      }
      return response;
    } catch (error) {
      this.logger.error('Error sending multicast message:', error);
      throw error;
    }
  }
}

