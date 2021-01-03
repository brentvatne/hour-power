import { PrismaClient, User } from "@prisma/client";
const prisma = new PrismaClient();

// Get the db user from the given params
export async function updateOrCreateUserAsync(options: {
  id: string;
  token: string;
  refreshToken: string;
  expiresIn: number;
}): Promise<User> {
  const params = {
    spotifyUserId: options.id,
    spotifyToken: options.token,
    spotifyRefreshToken: options.refreshToken,
    spotifyTokenExpiration: new Date(Date.now() + options.expiresIn * 1000),
  };

  return await prisma.user.upsert({
    create: params,
    update: params,
    where: {
      spotifyUserId: params.spotifyUserId,
    },
  });
}