import { prisma } from "./prisma";
import { DatingNotificationType } from "@prisma/client";

export async function createNotification(
  userId: string,
  type: DatingNotificationType,
  title: string,
  body: string,
  link?: string
) {
  await prisma.datingNotification.create({ data: { userId, type, title, body, link: link ?? null } });
}
