import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, Schema as MongooseSchema } from "mongoose";

export type AuditLogDocument = HydratedDocument<AuditLog>;

export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
}

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ type: String, required: true, enum: Object.values(AuditAction) })
  action: string;

  @Prop({ type: String, required: true })
  entity: string;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  entityId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  performedBy: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.Mixed })
  oldValue: Record<string, any>;

  @Prop({ type: MongooseSchema.Types.Mixed })
  newValue: Record<string, any>;

  @Prop({ type: String })
  ipAddress?: string;

  @Prop({ type: String })
  userAgent?: string;

  @Prop({ type: String })
  description?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Index for getting an entity's history
AuditLogSchema.index({ entity: 1, entityId: 1 });

// Index for getting actions by a specific user
AuditLogSchema.index({ performedBy: 1 });

// TTL Index: Automatically delete documents 30 days (2592000 seconds) after createdAt
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });
