import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Notification, NotificationType } from '../entities/notification.entity';

interface CreateNotificationInput {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async create(input: CreateNotificationInput) {
    const notification = this.notificationsRepository.create({
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link || null,
      metadata: input.metadata || null,
      readAt: null,
    });
    return this.notificationsRepository.save(notification);
  }

  async findMine(userId: number) {
    return this.notificationsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async countUnread(userId: number) {
    const count = await this.notificationsRepository.count({
      where: { userId, readAt: IsNull() },
    });
    return { count };
  }

  async markAsRead(userId: number, id: number) {
    const notification = await this.notificationsRepository.findOne({ where: { id } });
    if (!notification) throw new NotFoundException('Notificación no encontrada');
    if (notification.userId !== userId) {
      throw new ForbiddenException('No puedes modificar esta notificación');
    }
    if (!notification.readAt) {
      notification.readAt = new Date();
      await this.notificationsRepository.save(notification);
    }
    return notification;
  }

  async markAllAsRead(userId: number) {
    await this.notificationsRepository.update({ userId, readAt: IsNull() }, { readAt: new Date() });
    return { ok: true };
  }
}
