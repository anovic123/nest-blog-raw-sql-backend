import nodemailer from 'nodemailer';

export class EmailAdapter {
  public async sendEmail(email: string, subject: string, message: string) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      service: 'gmail',
      port: 587,
      secure: false,
      auth: {
        user: 'ethanparker1q@gmail.com',
        pass: 'miok jnte phtf rfwt',
      },
    });

    await transporter.sendMail({
      from: `"Vadim" <ethanparker1q@gmail.com>`, // sender address
      to: email,
      subject,
      html: ` <h1>Thank for your registration</h1>
                   <p>To finish registration please follow the link below:
                       <a href='https://somesite.com/confirm-email?code=${message}'>complete registration</a>
                       <p>${message}</p>
                   </p>
                  `,
    });

    return {
      email,
      subject,
      message,
    };
  }

  public async sendRecoveryEmail(
    email: string,
    subject: string,
    message: string,
  ) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      service: 'gmail',
      port: 587,
      secure: false,
      auth: {
        user: 'ethanparker1q@gmail.com',
        pass: 'miok jnte phtf rfwt',
      },
    });

    await transporter.sendMail({
      from: `"Vadim" <ethanparker1q@gmail.com>`, // sender address
      to: email,
      subject,
      html: ` <h1>Password recovery</h1>
                   <p>To finish password recovery please follow the link below:
                       <a href='https://somesite.com/password-recovery?recoveryCode=${message}'>recovery password</a>
                   </p>
                  `,
    });

    return {
      email,
      subject,
      message,
    };
  }
}