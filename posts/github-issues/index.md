# GitHub问题汇总

## 推送时报错秘钥格式不支持

GitHub在某次更新后改变了支持的秘钥策略，对于新增的RSA格式的SSH秘钥，如果是无密码加密的，会报错如下：

```
You're using an RSA key with SHA-1, which is no longer allowed. Please use a
```

GitHub的改动详情可以参考如下页面：https://github.blog/2021-09-01-improving-git-protocol-security-github/

>We’re changing which keys are supported in SSH and removing unencrypted Git protocol. Specifically we are:
>
>* Removing support for all DSA keys
>* Adding requirements for newly added RSA keys
>* Removing some legacy SSH algorithms (HMAC-SHA-1 and CBC ciphers)
>* Adding ECDSA and Ed25519 host keys for SSH
>* Turning off the unencrypted Git protocol

<!--more-->

如果不想给生成的RSA格式SSH秘钥附带一个密码，可以改用Ed25519格式来生成（GitHub也允许你关闭加密Git协议策略来放行无加密的RSA秘钥，但我没找到在哪配置）：

```
ssh-keygen -m PEM -t ed25519 -b 4096 -C "your_email@example.com"
```

记得修改上述命令中的邮箱地址为你的邮箱地址，然后执行命令过程中一路按回车键即可，如果以前生成过会提示你是否覆盖，这时候需要输入y再继续回车。

## 参考链接

* [Improving Git protocol security on GitHub](https://github.blog/2021-09-01-improving-git-protocol-security-github/)