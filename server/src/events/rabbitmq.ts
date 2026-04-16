import amqp from "amqplib";

let channel: any;

export const connectRabbitMQ = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL!);
  channel = await connection.createChannel();

  console.log("RabbitMQ connected");
};

export const getChannel = () => {
  if (!channel) {
    throw new Error("RabbitMQ not connected");
  }
  return channel;
};