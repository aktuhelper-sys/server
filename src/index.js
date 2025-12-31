'use strict';

import { Server } from 'socket.io';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) { },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // Initialize Socket.IO
    const io = new Server(strapi.server.httpServer, {
      cors: {
        origin: "http://localhost:3000", // Your Next.js frontend URL
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    // Store online users: Map<userId, socketId>
    const onlineUsers = new Map();

    io.on('connection', (socket) => {
      console.log('✅ User connected:', socket.id);

      // When user comes online
      socket.on('user:online', async (userId) => {
        try {
          onlineUsers.set(userId, socket.id);

          // Update lastActiveAt in database (for Strapi v5)
          await strapi.db.query('api::user-profile.user-profile').update({
            where: { id: userId },
            data: { lastActiveAt: new Date() }
          });

          // Broadcast updated online users list to all clients
          const onlineUserIds = Array.from(onlineUsers.keys());
          io.emit('users:online', onlineUserIds);

          console.log(`📡 User ${userId} is online. Total online: ${onlineUsers.size}`);
        } catch (error) {
          console.error('Error updating user status:', error);
        }
      });

      // When user disconnects
      socket.on('disconnect', () => {
        // Find and remove user from online list
        for (let [userId, socketId] of onlineUsers.entries()) {
          if (socketId === socket.id) {
            onlineUsers.delete(userId);

            // Broadcast updated list
            const onlineUserIds = Array.from(onlineUsers.keys());
            io.emit('users:online', onlineUserIds);

            console.log(`❌ User ${userId} disconnected. Total online: ${onlineUsers.size}`);
            break;
          }
        }
      });

      // Optional: Handle manual offline event
      socket.on('user:offline', (userId) => {
        onlineUsers.delete(userId);
        const onlineUserIds = Array.from(onlineUsers.keys());
        io.emit('users:online', onlineUserIds);
        console.log(`👋 User ${userId} went offline manually`);
      });
    });

    // Store io instance globally for potential use in controllers
    strapi.io = io;

    console.log('🚀 Socket.IO server initialized');
  },
};