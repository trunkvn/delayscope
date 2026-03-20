import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. SAVE TO DATABASE
    const prismaClient = prisma as any;
    if (!prismaClient.contact) {
      console.error("Prisma Error: 'contact' model is missing from the generated client. Try restarting the server.");
      return NextResponse.json(
        { error: "Database out of sync. Please contact admin." },
        { status: 500 }
      );
    }

    const contact = await prismaClient.contact.create({
      data: {
        name,
        email,
        message,
      },
    });
    console.log(`Contact saved to database with ID: ${contact.id}`);

    // 2. SEND EMAIL NOTIFICATION
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "daiduong020802@gmail.com",
        pass: process.env.EMAIL_PASS, // This must be an App Password
      },
    });

    const mailOptions = {
      from: `DelayScope Contact <${process.env.EMAIL_USER || "daiduong020802@gmail.com"}>`,
      to: "daiduong020802@gmail.com",
      subject: `[DelayScope] New Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n(Saved to DB: ${contact.id})`,
      replyTo: email,
    };

    if (process.env.EMAIL_PASS) {
      try {
        await transporter.sendMail(mailOptions);
        console.log(`Email notification sent to daiduong020802@gmail.com`);
      } catch (mailError) {
        console.error("Failed to send email notification:", mailError);
        // We still return success because it's already saved to DB
      }
    } else {
      console.log("-----------------------------------------");
      console.log("MOCKED EMAIL NOTIFICATION");
      console.log("REASON: EMAIL_PASS is not set in .env");
      console.log("-----------------------------------------");
    }

    return NextResponse.json({ success: true, id: contact.id });
    
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Failed to process contact request" },
      { status: 500 }
    );
  }
}
