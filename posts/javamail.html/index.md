# JavaMail-发送一封简单邮件（附带附件）

## 代码实现

最近使用到JavaMail，写了个简单的工具类，记录一下。
```java
import java.util.Date;
import java.util.Properties;

import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMessage.RecipientType;
import javax.mail.internet.MimeMultipart;

public class JavaMailUtils {
	//连接SMTP服务器的主机名，这里以qq邮箱为例
    private static final String SMTP_HOST = "smtp.qq.com";
    //连接的端口号，587为ssl端口，默认为25端口
    private static final String SMTP_PORT = "587";
    //发件人
    private static final String MAIL_FROM = "XXX@qq.com";
    //连接邮件服务器的用户名（邮箱地址去除了@qq.com的部分）
    private static final String USER = "XXX";
    /**
     * 授权码，就是你在邮件服务器上注册的密码，不是你的qq密码
     * 在邮箱里开启smtp/imap服务时需要发送短信，成功后会得到一个授权码
     */
    private static final String PASSWORD = "授权码";

    private JavaMailUtils() {
    }

    /**
     * send mail without attachments
     *
     * @param mailTo
     * @param mailCc
     * @param subject
     * @param content
     * @throws AddressException
     * @throws MessagingException
     */
    public static void sendMail(final String mailTo, final String mailCc, final String subject, final String content)
            throws Exception {
        // get the session
        final Session session = getSession();
        // create a mail
        final MimeMessage message = createMail(session, mailTo, mailCc, subject, content);
        // get the transport
        final Transport transport = session.getTransport();
        transport.connect(USER, PASSWORD);
        transport.sendMessage(message, message.getAllRecipients());
        transport.close();
    }

    public static void sendMail(final String mailTo, final String mailCc, final String subject, final String content,
            final String[] attachments) throws Exception {
        // get the session
        final Session session = getSession();
        // create a mail
        final MimeMessage message = createMail(session, mailTo, mailCc, subject, content, attachments);
        // get the transport
        final Transport transport = session.getTransport();
        transport.connect(USER, PASSWORD);
        transport.sendMessage(message, message.getAllRecipients());
        transport.close();
    }

    /**
     * create a mail without attachments
     *
     * @param session
     * @param mailTo
     * @param mailCc
     * @param subject
     * @param content
     * @return
     * @throws Exception
     */
    private static MimeMessage createMail(final Session session, final String mailTo, final String mailCc,
            final String subject, final String content) throws Exception {
        final MimeMessage message = new MimeMessage(session);
        message.setFrom(new InternetAddress(MAIL_FROM));
        message.setRecipients(RecipientType.TO, InternetAddress.parse(mailTo));
        message.setRecipients(RecipientType.CC, InternetAddress.parse(mailCc));
        message.setSubject(subject);
        message.setContent(content, "text/html;charset=UTF-8");
        message.setSentDate(new Date());
        message.saveChanges();

        return message;
    }

    /**
     * create a mail with attachments
     *
     * @param session
     * @param mailTo
     * @param mailCc
     * @param subject
     * @param content
     * @param attachments
     * @return
     */
    private static MimeMessage createMail(final Session session, final String mailTo, final String mailCc,
            final String subject, final String content, final String[] attachments) throws Exception {
        final MimeMessage message = new MimeMessage(session);
        message.setFrom(new InternetAddress(MAIL_FROM));
        message.setRecipients(RecipientType.TO, InternetAddress.parse(mailTo));
        message.setRecipients(RecipientType.CC, InternetAddress.parse(mailCc));
        message.setSubject(subject);
        // set the multipart of the mail
        final MimeMultipart multipart = new MimeMultipart();
        // set content part of the mail
        final MimeBodyPart contentPart = new MimeBodyPart();
        contentPart.setContent(content, "text/html;charset=UTF-8");
        multipart.addBodyPart(contentPart);
        // set attachment part of the mail
        final MimeBodyPart attach1 = new MimeBodyPart();
        final MimeBodyPart attach2 = new MimeBodyPart();
        if (attachments != null && attachments.length != 0) {
            final int length = attachments.length;
            if (length == 1) {
                attach1.attachFile(attachments[0]);
                multipart.addBodyPart(attach1);
            }
            if (length == 2) {
                attach1.attachFile(attachments[0]);
                attach2.attachFile(attachments[1]);
                multipart.addBodyPart(attach1);
                multipart.addBodyPart(attach2);
            }
        }
        message.setContent(multipart);
        message.setSentDate(new Date());
        message.saveChanges();

        return message;
    }

    /**
     * get the session to transport mails
     */
    private static Session getSession() {
        // set the properties for connecting the mail server
        final Properties props = new Properties();
        props.setProperty("mail.debug", "true");
        props.setProperty("mail.transport.protocol", "smtp");
        props.setProperty("mail.host", SMTP_HOST);
        props.setProperty("mail.smtp.auth", "true");
        props.setProperty("mail.smtp.port", SMTP_PORT);
        // ssl
        props.setProperty("mail.imap.ssl.enable", "true");
        props.setProperty("mail.imap.ssl.socketFactory.class", "DummySSLSocketFactory");
        props.setProperty("mail.imap.ssl.socketFactory.fallback", "false");
        // create the session
        final Session session = Session.getDefaultInstance(props);

        return session;
    }

}
```
<!--more-->

以上的工具类有个进行了重载的方法，因为对于没有附件的邮件和有附件的邮件，在构造邮件对象时是不一样的，有附件的邮件会稍微复杂一点。接着是测试类。

```java
public class Test {
	//收件人，多人的话要用英文的","来隔开
    private static final String MAIL_TO = "XXX@qq.com";
    //抄送人，多人的话要用英文的","来隔开
    private static final String MAIL_CC = "XXX@qq.com";
    //邮件的主题（因为只是测试用，所以写成静态常量了）
    private static final String SUBJECT = "It's a test mail";
    //邮件的内容（因为只是测试用，所以写成静态常量了）
    private static final String CONTENT = "Hello World!<br>Bye!";
    private static final String FILE_1 = "附件1的路径";
    private static final String FILE_2 = "附件2的路径";

    public static void main(final String[] args) {
        final String[] attachments = {};
//        final String[] attachments = {FILE_1, FILE_2};
        try {
//            JavaMailUtils.sendMail(MAIL_TO, MAIL_CC, SUBJECT, CONTENT);
            JavaMailUtils.sendMail(MAIL_TO, MAIL_CC, SUBJECT, CONTENT, attachments);
        } catch (final Exception e) {
            e.printStackTrace();
        }
    }
}
```

最后是导入的jar包：

[javax.mail-1.6.0.jar](http://download.csdn.net/download/lewky_liu/10129340)

## 补充

JavaMail提供了多个属性，这些属性的值都必须是字符串，否则设置无效，如下：
* `mail.smtp.sendpartial`设置为`"true"`，当一次发送多个地址时就不会因为某个地址无效而全部发送失败。
* `mail.smtp.auth`设置为`"false"`时，则无需验证账号密码即可发送邮件。SMTP只是个简单的邮件发送协议，如果不设置校验，可能会造成垃圾邮件泛滥的问题。不过我发现公司项目在发送邮件时并没有设置验证，可能是图方便。

## 参考链接

* [[疑问]JavaMail的mail.smtp.sendpartial不起作用？](http://www.mytju.com/classCode/news_readNews.asp?newsID=231)