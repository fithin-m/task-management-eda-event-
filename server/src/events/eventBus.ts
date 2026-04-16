import { getChannel } from "./rabbitmq";

export const publishEvent = async (queue: string, data: any) => {
  const channel = getChannel();

  await channel.assertQueue(queue);

  channel.sendToQueue(
    queue,
    Buffer.from(JSON.stringify(data))
  );
};