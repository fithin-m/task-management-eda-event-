import { getChannel } from "../../events/rabbitmq";
import prisma from "../../core/database/prisma";
import { sendEmail } from "../../core/utils/email";

export const startNotificationConsumer = async () => {
    const channel = getChannel();

    await channel.assertQueue("TASK_CREATED");

    channel.consume("TASK_CREATED", async (msg: any) => {
        if (msg !== null) {
            const data = JSON.parse(msg.content.toString());

            try {
                console.log("Event received:", data);

                // Get user email
                const user = await prisma.user.findUnique({
                    where: { id: data.assignedTo }
                });

                if (!user) throw new Error("User not found");

                await prisma.notification.create({
                    data: {
                        userId: user.id,
                        message: `New task assigned: ${data.title}`,
                        type: "TASK_ASSIGNED",
                    },
                });

                await sendEmail(
                    user.email,
                    "New Task Assigned",
                    `You have been assigned a new task: ${data.title}`
                );

                channel.ack(msg);

            } catch (error) {
                console.error("Error processing event:", error);
            }
        }
    });
};