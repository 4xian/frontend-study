---
id: backend.java.learn.advanced.cryptography-secrets-and-license-verification
type: lesson
title: 密码学 API、秘密管理、签名与许可证校验
summary: 用固定密码学合同、受控秘密生命周期和 fail-closed 状态机保护密文、请求签名与离线许可证
domain: backend
technology: java
module: core
stage: advanced
level: advanced
estimatedMinutes: 300
objectives:
  - 能为 JCA 操作冻结 engine、algorithm、key、parameters 和 provider policy 五元合同。
  - 能区分安全随机、密码哈希、PBKDF2/PBE 与 Java 25 HKDF 的用途边界。
  - 能实现 AES-GCM 的 nonce、AAD、tag、envelope 与失败不发布明文合同。
  - 能区分 digest、MAC 和 digital signature，并冻结 canonical payload 与 key registry。
  - 能设计 PKCS12、外部秘密来源、轮换与 TLS 默认身份校验边界。
  - 能把验签、业务绑定、时间窗、撤销与本地状态组合成许可证 fail-closed 状态机。
prerequisites:
  - backend.java.learn.basics.strings-encoding-and-text-matching
  - backend.java.learn.advanced.authentication-authorization-and-jwt
related: []
tags:
  - Java
  - JCA
  - AES-GCM
  - SecureRandom
  - KeyStore
  - 密钥轮换
  - 数字签名
  - 许可证
appliesTo: Java 25 / Spring Boot 4.1.0 / Spring Framework 7.0.8 / Bouncy Castle 1.85.2 主线；项目补充适用于 Java 8 / Spring Boot 2.3.12.RELEASE / Spring Framework 5.2.15.RELEASE
modernBaseline:
  java: '25'
  springBoot: 4.1.0
  springFramework: 7.0.8
  bouncyCastleProvider: 1.85.2
legacyBaseline:
  java: '8'
  springBoot: 2.3.12.RELEASE
  springFramework: 5.2.15.RELEASE
verifiedAt: 2026-08-13
sources:
  - id: openjdk-25
    title: OpenJDK JDK 25 Project
    url: https://openjdk.org/projects/jdk/25/
    sourceType: official-reference
    appliesTo: Java 25
    claims: ['JDK 25 于 2025-09-16 GA，作为现代语言与标准库基线']
  - id: jdk25-jca-guide
    title: Java 25 JCA Reference Guide
    url: https://docs.oracle.com/en/java/javase/25/security/java-cryptography-architecture-jca-reference-guide.html
    sourceType: official-reference
    appliesTo: Java 25 JCA
    claims: ['JCA 使用 engine/provider 架构，算法请求与 provider 实现是两个边界']
  - id: jdk25-standard-names
    title: Java 25 Security Standard Algorithm Names
    url: https://docs.oracle.com/en/java/javase/25/docs/specs/security/standard-names.html
    sourceType: specification
    appliesTo: Java 25 security algorithms
    claims: ['标准名定义可移植算法标识，不替代 mode、padding、key 与参数安全审查']
  - id: jdk25-providers
    title: Java 25 Oracle Providers
    url: https://docs.oracle.com/en/java/javase/25/security/oracle-providers.html
    sourceType: official-reference
    appliesTo: Java 25 providers
    claims: ['provider 能力和默认实现会变化，协议不能依赖未冻结的默认值']
  - id: jdk25-secure-random
    title: Java 25 SecureRandom API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/security/SecureRandom.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['SecureRandom 提供密码学强随机数；算法、播种与阻塞特性仍需按 provider 核验']
  - id: jdk25-drbg-parameters
    title: Java 25 DrbgParameters API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/security/DrbgParameters.html
    sourceType: api-doc
    appliesTo: Java 25 DRBG
    claims: ['strength、capability、personalization、reseed 和 prediction resistance 是独立合同']
  - id: openjdk-jep510-kdf
    title: JEP 510 Key Derivation Function API
    url: https://openjdk.org/jeps/510
    sourceType: specification
    appliesTo: JDK 25
    claims: ['JDK 25 交付标准 KDF API 与 HKDF 支持']
  - id: jdk25-kdf
    title: Java 25 KDF API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/javax/crypto/KDF.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['KDF 从输入 key material 派生 key，不能代替人类密码哈希']
  - id: jdk25-pbe-key-spec
    title: Java 25 PBEKeySpec API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/javax/crypto/spec/PBEKeySpec.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['PBEKeySpec 使用 char 数组并提供 clearPassword，salt、iteration 和 key length 需显式指定']
  - id: nist-sp800-132
    title: NIST SP 800-132 Password-Based Key Derivation
    url: https://csrc.nist.gov/pubs/sp/800/132/final
    sourceType: security-standard
    appliesTo: password-based key derivation
    claims: ['密码派生需要 salt、批准的 PRF、足够迭代成本与用途隔离']
  - id: nist-800-63b-passwords
    title: NIST SP 800-63B Password Verifiers
    url: https://pages.nist.gov/800-63-4/sp800-63b/authenticators/
    sourceType: security-standard
    appliesTo: password verification
    claims: ['密码验证值使用带 salt、可升级成本的专用 password hashing scheme']
  - id: nist-sp800-90a-r1
    title: NIST SP 800-90A Revision 1
    url: https://csrc.nist.gov/pubs/sp/800/90/a/r1/final
    sourceType: security-standard
    appliesTo: DRBG
    claims: ['DRBG 的 instantiate、generate 和 reseed 行为需要明确强度与状态合同']
  - id: jdk25-key
    title: Java 25 Key API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/security/Key.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['key 的 algorithm、format 和 encoded form 是不同属性，encoded secret/private key 仍是秘密']
  - id: jdk25-key-generation
    title: Java 25 KeyPairGenerator API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/security/KeyPairGenerator.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['key generation 需要固定算法、参数、随机源与 provider policy']
  - id: nist-sp800-57-part1-r5
    title: NIST SP 800-57 Part 1 Revision 5
    url: https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final
    sourceType: security-standard
    appliesTo: cryptographic key management
    claims: ['key 生命周期包括生成、分发、存储、使用、轮换、撤销、归档与销毁']
  - id: jdk25-cipher
    title: Java 25 Cipher API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/javax/crypto/Cipher.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['Cipher transformation 应显式包含 algorithm/mode/padding；AEAD 的 AAD 必须先于 ciphertext']
  - id: jdk25-gcm-parameter-spec
    title: Java 25 GCMParameterSpec API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/javax/crypto/spec/GCMParameterSpec.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['GCM 参数显式携带 authentication tag 长度和 IV']
  - id: nist-sp800-38d
    title: NIST SP 800-38D GCM and GMAC
    url: https://csrc.nist.gov/pubs/sp/800/38/d/final
    sourceType: security-standard
    appliesTo: AES-GCM
    claims: ['每把 key 下 IV 唯一是 GCM 安全前提，96-bit IV 是推荐路径']
  - id: rfc5116-aead
    title: RFC 5116 Authenticated Encryption Interface
    url: https://www.rfc-editor.org/rfc/rfc5116.html
    sourceType: specification
    appliesTo: AEAD
    claims: ['AEAD 同时接收 key、nonce、AAD 和 plaintext/ciphertext，认证失败不得发布明文']
  - id: jdk25-signature
    title: Java 25 Signature API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/security/Signature.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['Signature 由 private key 签名、public key 验证，适合签发方与 verifier 分离']
  - id: jdk25-mac
    title: Java 25 Mac API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/javax/crypto/Mac.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['Mac 使用共享 secret，所有 verifier 都具有生成有效 MAC 的能力']
  - id: rfc7515-jws
    title: RFC 7515 JSON Web Signature
    url: https://www.rfc-editor.org/rfc/rfc7515.html
    sourceType: specification
    appliesTo: signed envelope design
    claims: ['签名对象需要冻结受保护头、payload bytes、算法与验证规则']
  - id: rfc8785-json-canonicalization
    title: RFC 8785 JSON Canonicalization Scheme
    url: https://www.rfc-editor.org/rfc/rfc8785.html
    sourceType: specification
    appliesTo: canonical JSON
    claims: ['普通 JSON 对象语义不足以定义稳定签名字节，canonicalization 需冻结编码和序列化规则']
  - id: rfc5280-pkix
    title: RFC 5280 PKIX Certificate and CRL Profile
    url: https://www.rfc-editor.org/rfc/rfc5280.html
    sourceType: specification
    appliesTo: PKIX validation
    claims: ['证书路径、trust anchor、validity 和 revocation 是公钥信任合同的一部分']
  - id: jdk25-key-store
    title: Java 25 KeyStore API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/security/KeyStore.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['KeyStore 可保存 key/certificate entry；store 与 entry 保护及外部权限仍需独立治理']
  - id: openjdk-jep229-pkcs12-default
    title: JEP 229 Create PKCS12 Keystores by Default
    url: https://openjdk.org/jeps/229
    sourceType: specification
    appliesTo: JDK 9+
    claims: ['JDK 9 才把默认 keystore type 改为 PKCS12，跨版本协议应显式指定类型']
  - id: spring-boot-410-external-config
    title: Spring Boot 4.1 Externalized Configuration
    url: https://raw.githubusercontent.com/spring-projects/spring-boot/v4.1.0/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/features/external-config.adoc
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims: ['Config Data 和 configtree 可从挂载文件导入配置，但不提供秘密加密、轮换或访问控制']
  - id: spring-boot-410-actuator-sanitization
    title: Spring Boot 4.1 Actuator Endpoints
    url: https://raw.githubusercontent.com/spring-projects/spring-boot/v4.1.0/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/endpoints.adoc
    sourceType: official-reference
    appliesTo: Spring Boot 4.1.0
    claims: ['env/configprops 暴露与值显示受授权和 sanitization 配置约束，秘密不得依赖默认脱敏']
  - id: spring-boot-2312-external-config
    title: Spring Boot 2.3.12 Externalized Configuration
    url: https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/spring-boot-features.html#boot-features-external-config
    sourceType: official-reference
    appliesTo: Spring Boot 2.3.12.RELEASE
    claims: ['旧线支持其归档外部配置来源，但没有 Boot 2.4 引入的 configtree 合同']
  - id: jdk25-jsse-guide
    title: Java 25 JSSE Reference Guide
    url: https://docs.oracle.com/en/java/javase/25/security/java-secure-socket-extension-jsse-reference-guide.html
    sourceType: official-reference
    appliesTo: Java 25 JSSE
    claims: ['默认 trust manager、证书路径和 endpoint identity 共同建立 TLS 服务端身份']
  - id: jdk25-https-url-connection
    title: Java 25 HttpsURLConnection API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/javax/net/ssl/HttpsURLConnection.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['自定义 HostnameVerifier 与全局默认会改变 HTTPS 身份验证边界']
  - id: cwe-295-certificate-validation
    title: CWE-295 Improper Certificate Validation
    url: https://cwe.mitre.org/data/definitions/295.html
    sourceType: security-standard
    appliesTo: TLS certificate validation risk
    claims: ['证书验证不完整会使客户端接受不可信端点']
  - id: bc-provider-1-85-2
    title: Bouncy Castle Provider 1.85.2 Maven POM
    url: https://repo1.maven.org/maven2/org/bouncycastle/bcprov-jdk18on/1.85.2/bcprov-jdk18on-1.85.2.pom
    sourceType: official-reference
    appliesTo: bcprov-jdk18on 1.85.2
    claims: ['现代 provider 示例固定 org.bouncycastle:bcprov-jdk18on:1.85.2 并声明 Java 8+']
  - id: bc-sm2-sm3-1-85-2-gm
    title: Bouncy Castle 1.85.2 GM Provider Registration
    url: https://raw.githubusercontent.com/bcgit/bc-java/r1rv85v2/prov/src/main/java/org/bouncycastle/jcajce/provider/asymmetric/GM.java
    sourceType: source-code
    appliesTo: Bouncy Castle provider tag r1rv85v2
    claims: ['固定 tag 可核验 GM/SM2 provider 注册名，项目类名不能替代互操作参数验证']
  - id: bc-sm2-sm3-1-85-2-sm3
    title: Bouncy Castle 1.85.2 SM3 Provider Registration
    url: https://raw.githubusercontent.com/bcgit/bc-java/r1rv85v2/prov/src/main/java/org/bouncycastle/jcajce/provider/digest/SM3.java
    sourceType: source-code
    appliesTo: Bouncy Castle provider tag r1rv85v2
    claims: ['固定 tag 可核验 SM3 provider 注册与别名']
  - id: bc-java-1-85-release
    title: Bouncy Castle Java 1.85 Release
    url: https://www.bouncycastle.org/resources/new-release-bouncy-castle-java-1-85
    sourceType: release-note
    appliesTo: Bouncy Castle Java 1.85 product line
    claims: ['产品发布线 1.85 与 Maven provider patch 1.85.2 是不同版本粒度']
  - id: jdk8-jca-guide
    title: Java 8 JCA Reference Guide
    url: https://docs.oracle.com/javase/8/docs/technotes/guides/security/crypto/CryptoSpec.html
    sourceType: official-reference
    appliesTo: Java 8
    claims: ['Java 8 已有 JCA/JCE engine/provider 架构，但没有 Java 25 KDF/DRBG API']
  - id: jdk8-sun-providers
    title: Java 8 Oracle Providers
    url: https://docs.oracle.com/javase/8/docs/technotes/guides/security/SunProviders.html
    sourceType: official-reference
    appliesTo: Java 8
    claims: ['Java 8 provider 能力必须按旧运行时核验，不能复制现代 provider 清单']
  - id: jdk8-cipher
    title: Java 8 Cipher API
    url: https://docs.oracle.com/javase/8/docs/api/javax/crypto/Cipher.html
    sourceType: api-doc
    appliesTo: Java 8
    claims: ['Java 8 Cipher 已支持 AEAD 调用顺序与完整 transformation']
  - id: jdk8-gcm-parameter-spec
    title: Java 8 GCMParameterSpec API
    url: https://docs.oracle.com/javase/8/docs/api/javax/crypto/spec/GCMParameterSpec.html
    sourceType: api-doc
    appliesTo: Java 8
    claims: ['Java 8 可显式传入 GCM tag length 与 IV']
  - id: jdk8-pbe-key-spec
    title: Java 8 PBEKeySpec API
    url: https://docs.oracle.com/javase/8/docs/api/javax/crypto/spec/PBEKeySpec.html
    sourceType: api-doc
    appliesTo: Java 8
    claims: ['Java 8 已支持基于 char[] 的 PBEKeySpec 与 clearPassword']
  - id: jdk8-key-store
    title: Java 8 KeyStore API
    url: https://docs.oracle.com/javase/8/docs/api/java/security/KeyStore.html
    sourceType: api-doc
    appliesTo: Java 8
    claims: ['Java 8 支持 PKCS12，但默认类型仍不能作为跨版本协议合同']
  - id: jdk8-jsse-guide
    title: Java 8 JSSE Reference Guide
    url: https://docs.oracle.com/javase/8/docs/technotes/guides/security/jsse/JSSERefGuide.html
    sourceType: official-reference
    appliesTo: Java 8
    claims: ['Java 8 TLS 同样需要 trust path 与 hostname/endpoint identity 验证']
  - id: jdk25-hkdf-parameter-spec
    title: Java 25 HKDFParameterSpec API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/javax/crypto/spec/HKDFParameterSpec.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['HKDF extract/expand 显式接收 IKM、salt、info 与输出长度']
  - id: rfc5869-hkdf
    title: RFC 5869 HKDF
    url: https://www.rfc-editor.org/rfc/rfc5869.txt
    sourceType: specification
    appliesTo: HKDF
    claims: ['HKDF 用 extract-and-expand 从高熵输入派生上下文隔离子密钥，不是 password hashing']
  - id: rfc8018-pkcs5
    title: RFC 8018 PKCS #5 Password-Based Cryptography
    url: https://www.rfc-editor.org/rfc/rfc8018.txt
    sourceType: specification
    appliesTo: PBKDF2 and PBE
    claims: ['PBKDF2 参数包括 salt、iteration、PRF 与 derived-key length，PBE 还需独立加密合同']
  - id: jdk25-message-digest
    title: Java 25 MessageDigest API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/security/MessageDigest.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['digest 没有 secret/private key，不能替代 MAC 或 digital signature']
  - id: spring-boot-24-config-data
    title: Spring Boot 2.4 Config Data Release Note
    url: https://spring.io/blog/2020/08/14/config-file-processing-in-spring-boot-2-4
    sourceType: release-note
    appliesTo: Spring Boot 2.4+
    claims: ['spring.config.import 与 configtree 属于 Boot 2.4 引入的 Config Data 机制']
  - id: jdk25-ssl-parameters
    title: Java 25 SSLParameters API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/javax/net/ssl/SSLParameters.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['raw SSLSocket/SSLEngine 需要非空 endpoint identification algorithm 才要求服务身份匹配']
  - id: jdk25-cert-path-validator
    title: Java 25 CertPathValidator API
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/security/cert/CertPathValidator.html
    sourceType: api-doc
    appliesTo: Java 25
    claims: ['PKIX path validation 与 endpoint identity 是两个独立检查层']
  - id: rfc9525-tls-service-identity
    title: RFC 9525 Service Identity in TLS
    url: https://www.rfc-editor.org/rfc/rfc9525.txt
    sourceType: security-standard
    appliesTo: TLS service identity
    claims: ['客户端需同时完成 PKIX path validation 与 reference identifier/SAN 匹配']
  - id: rfc8725-jwt-bcp
    title: RFC 8725 JSON Web Token Best Current Practices
    url: https://www.rfc-editor.org/rfc/rfc8725.html
    sourceType: security-standard
    appliesTo: signed token verification patterns
    claims: ['verifier 固定算法 allowlist、key 绑定和上下文校验；许可证只借鉴该 fail-closed 模式']
  - id: cwe-321-hard-coded-key
    title: CWE-321 Use of Hard-coded Cryptographic Key
    url: https://cwe.mitre.org/data/definitions/321.html
    sourceType: security-standard
    appliesTo: hard-coded key risk
    claims: ['硬编码 key 会扩大共享泄漏范围并阻碍独立轮换']
  - id: cwe-330-insufficient-randomness
    title: CWE-330 Use of Insufficiently Random Values
    url: https://cwe.mitre.org/data/definitions/330.html
    sourceType: security-standard
    appliesTo: randomness risk
    claims: ['可预测或低熵安全值会削弱 key、token 与 nonce']
  - id: cwe-347-signature-verification
    title: CWE-347 Improper Verification of Cryptographic Signature
    url: https://cwe.mitre.org/data/definitions/347.html
    sourceType: security-standard
    appliesTo: signature verification risk
    claims: ['缺失或错误的验签流程会接受不可信数据']
  - id: cwe-636-fail-open
    title: CWE-636 Not Failing Securely
    url: https://cwe.mitre.org/data/definitions/636.html
    sourceType: security-standard
    appliesTo: fail-open risk
    claims: ['安全检查缺失、异常或不可用时继续受保护流程属于 fail-open']
projectEvidence:
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/AESUtils.java
    symbol: com.tdh.bdzz.util.AESUtils
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/JzRSAUtils.java
    symbol: com.tdh.bdzz.util.JzRSAUtils
    usage: observed
  - file: dzzz-app/src/main/java/tdh/platform/component/license/lic/License.java
    symbol: tdh.platform.component.license.lic.License
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/HMacUtils.java
    symbol: com.tdh.bdzz.util.HMacUtils
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/util/SM2Util.java
    symbol: com.tdh.bdzz.util.SM2Util
    usage: observed
  - file: dzzz-app/src/main/java/com/tdh/bdzz/config/DataSourceConfig.java
    symbol: com.tdh.bdzz.config.DataSourceConfig
    usage: observed
---

# 密码学 API、秘密管理、签名与许可证校验

## 为什么需要学习

`Cipher.getInstance()` 成功只说明当前 provider 能创建对象，不说明算法、mode、padding、key、nonce 或协议安全。相同地，`Signature.verify()` 返回 true 只证明某组 bytes 由对应私钥签过，不会自动证明许可证属于当前产品、仍在有效期、没有撤销或允许当前功能。

本课把这些容易混在一起的结论拆成连续 Gate：先冻结密码学调用合同，再管理 key 与 secret 生命周期，最后把 cryptographic proof 组合进业务状态机。任何 Gate 缺失、未知或异常都不能产生明文、可信请求或授权对象。

## 学习目标

- 能为一次 JCA 调用写出可审查的五元合同。
- 能按用途选择 `SecureRandom`、password hashing、PBKDF2/PBE 或 HKDF。
- 能实现版本化 AES-GCM envelope，并验证篡改、错误 AAD 和未知 key。
- 能为请求 MAC 与许可证签名定义无歧义 canonical bytes。
- 能为秘密来源、PKCS12、轮换、TLS 与许可证撤销写出失败合同。

## 前置术语

engine 是 `Cipher`、`Mac`、`Signature` 等 JCA 服务接口；provider 是具体实现。nonce 是一把 key 下不得重用的公开输入，salt 是密码派生的随机输入，AAD 是不加密但必须认证的上下文。digest、MAC 与 signature 分别提供摘要、共享密钥认证和非对称签发证明。

## 零基础知识点详解

### JCA 调用先冻结五元合同

**它是什么：** 一次密码学操作由 engine、algorithm/transformation、key purpose/format、parameters 和 provider policy 五部分共同定义。

**有什么作用：** 防止默认 mode、算法混淆、key 用途串用和 provider 漂移。

**什么时候使用：** 创建 `Cipher`、`Mac`、`Signature`、`KeyFactory`、`KeyGenerator` 或 `KeyStore` 前。

**怎么使用：** 固定完整 transformation；将算法与 key ID 绑定在本地 registry；校验 key 长度、nonce/tag、provider 能力和失败分类；协议输入不能自由指定 provider 或算法。

**最小示例：**

```java
Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
cipher.init(Cipher.ENCRYPT_MODE, dataKey, new GCMParameterSpec(128, nonce));
```

**运行结果：** mode、padding、key 与 GCM 参数都可被测试和审查，而不是依赖 `"AES"` 的 provider 默认值。

**常见误区：** 把 `getInstance()` 成功或 key 长度正确等同于整个协议安全。

### key 的生成、重建与编码不是一回事

**它是什么：** generator 生成新 key material；factory 根据明确 spec/encoding 重建既有 key；X.509 public、PKCS#8 private 和 raw secret key 格式不可互换。

**有什么作用：** 让 key 的用途、来源、格式和生命周期保持可追踪。

**什么时候使用：** 生成数据 key、加载签名公私钥、导入 provider key 或保存 KeyStore entry 时。

**怎么使用：** 生成时固定算法、参数与 `SecureRandom`；重建时校验格式和用途；private/secret encoded bytes 视为秘密；public key 可分发但要防替换和用途串用。

**最小示例：**

```java
KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
generator.initialize(2048, secureRandom);
KeyPair issuerKey = generator.generateKeyPair();
```

**运行结果：** 私钥只进入签发端，验证端只获得注册表中的对应公钥。

**常见误区：** 将 Base64 编码误当加密，或把 `getEncoded()` 的私钥写入日志。

### SecureRandom 与 DRBG 要按用途配置

**它是什么：** `SecureRandom` 是 JCA 的密码学随机入口；Java 25 的 DRBG 参数进一步描述 strength、capability、personalization 与 reseed。

**有什么作用：** 为 key、token、salt 和 nonce 提供不可预测输入，并让 provider 行为可观测。

**什么时候使用：** 生成任何安全相关随机值时；GCM nonce 还需要额外的 per-key 唯一性策略。

**怎么使用：** 使用系统播种的 `SecureRandom`；记录实际算法/provider；仅在需求明确时选择 DRBG 或 strong instance；不要注入低熵固定 seed，也不要用统计样本“证明安全”。

**最小示例：**

```java
byte[] nonce = new byte[12];
secureRandom.nextBytes(nonce);
```

**运行结果：** 得到 96-bit GCM nonce；系统仍需按 key 统计调用量和碰撞预算。

**常见误区：** 用 `Random`、时间戳、UUID 截断或固定 seed 生成 token、key 或 nonce。

### password hashing、PBKDF2/PBE 与 HKDF 分工不同

**它是什么：** password hashing 保存不可逆验证值；PBKDF2 从低熵密码增加穷举成本；PBE 再组合加密；HKDF 从高熵 key material 派生上下文隔离子密钥。

**有什么作用：** 避免低熵密码直接成为 AES key，也避免把快速 HKDF 当密码存储方案。

**什么时候使用：** 登录密码优先采用专用 password hashing scheme；兼容 PBE 使用 PBKDF2；Java 25 的 HKDF 用于高熵 IKM 子密钥派生。

**怎么使用：** 为密码验证保存随机 salt、算法、成本与版本；PBE 独立保存 KDF 和 AEAD 参数；HKDF 固定 salt/info domain；使用 `char[]` 并及时 `clearPassword()`。

**最小示例：**

```java
PBEKeySpec spec = new PBEKeySpec(password, salt, iterations, 256);
try {
    byte[] derived = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
        .generateSecret(spec).getEncoded();
} finally {
    spec.clearPassword();
}
```

**运行结果：** 派生参数可版本化；不同 salt 得到不同结果，明文密码不会成为固定 AES key。

**常见误区：** 截断、补零或快速 hash 密码作为数据 key；在 Java 8 代码中引用不存在的 `javax.crypto.KDF`。

### AES-GCM 是完整 AEAD 协议

**它是什么：** AES-GCM 同时保护 plaintext 的机密性、完整性和 AAD 上下文。

**有什么作用：** 让 tenant、record、purpose 和 schema 等上下文不能被替换。

**什么时候使用：** 需要对应用数据进行对称加密且双方能维护可靠 nonce/key 生命周期时。

**怎么使用：** 每把 key 下分配唯一 96-bit nonce；先 `updateAAD`，再处理 plaintext/ciphertext；使用 128-bit tag；只有解密 `doFinal` 成功后才发布 plaintext。

**最小示例：**

```java
cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(128, nonce));
cipher.updateAAD(aad);
byte[] ciphertextAndTag = cipher.doFinal(plaintext);
```

**运行结果：** 密文或 AAD 改一位都会在最终 tag 验证时被拒绝。

**常见误区：** 同一 key 重用 nonce，或捕获 `AEADBadTagException` 后继续使用部分明文。

### versioned envelope 限制算法和 key 选择

**它是什么：** envelope 至少记录本地可识别的 `version`、`keyId`、`nonce` 和 `ciphertext+tag`。

**有什么作用：** 支持 key rotation 和数据迁移，同时阻止输入动态选择任意算法、provider、URL 或文件。

**什么时候使用：** 持久化或跨服务传输 AEAD 密文时。

**怎么使用：** version 映射本地固定 algorithm profile；keyId 只查用途固定的 registry；限制长度、结构和总大小；未知 version/key 全部拒绝。

**最小示例：**

```java
if (envelope.version() != 1) throw new GeneralSecurityException("unsupported version");
SecretKey key = encryptionKeys.require(envelope.keyId());
```

**运行结果：** 轮换期可以 read-old/write-new，攻击者不能用 envelope 扩大信任边界。

**常见误区：** 把 `alg`、`kid` 或 provider name 当成已经可信的协议事实。

### digest、MAC 和 signature 的信任模型不同

**它是什么：** digest 无 secret；MAC 由共享 secret 生成和验证；signature 由 private key 签发、public key 验证。

**有什么作用：** 为完整性、双方共享认证和发行方唯一签发选择正确原语。

**什么时候使用：** 文件摘要、API 请求认证和离线许可证分别审查，而不是统一叫“加密”。

**怎么使用：** digest 只用于摘要；MAC key 按参与方共享；许可证私钥只在发行侧，客户端内置受保护的 public key registry。

**最小示例：**

```java
Signature verifier = Signature.getInstance("SHA256withECDSA");
verifier.initVerify(trustedPublicKey);
verifier.update(canonicalPayload);
boolean valid = verifier.verify(signatureBytes);
```

**运行结果：** verifier 可以确认签发者，却不能生成新许可证。

**常见误区：** 用 HMAC secret 嵌入所有离线客户端，声称只有发行方能签发。

### canonical bytes 是签名协议的一部分

**它是什么：** canonicalization 冻结字段集合、顺序、编码、数字、时间、unknown-field policy 和大小，产生唯一签名字节。

**有什么作用：** 避免同一对象被不同 serializer 写成不同 bytes，或不同对象碰巧解析成相同语义。

**什么时候使用：** 任何跨进程 MAC、签名、许可证或审计链。

**怎么使用：** 直接签协议定义的 bytes；JSON 使用固定 canonical profile；简单协议可使用长度前缀字段；验证端先限流和解析，再重建同一 bytes。

**最小示例：**

```java
buffer.putInt(productBytes.length).put(productBytes);
buffer.putInt(subjectBytes.length).put(subjectBytes);
```

**运行结果：** 字段边界无分隔符歧义，签发端和验证端得到同一输入。

**常见误区：** 对普通对象随手重新 JSON 序列化后验签，依赖字段迭代顺序。

### 请求 HMAC 还需要时间窗和 replay guard

**它是什么：** 请求认证把 method、target、timestamp、nonce 和 body digest 组成 canonical request，再用共享 key 计算 MAC。

**有什么作用：** 防止正文和目标被改写，并限制捕获请求的可重放窗口。

**什么时候使用：** 双方可安全共享 secret 的服务间请求；它不替代 TLS 或资源授权。

**怎么使用：** 固定方法和目标规范化；先校验 key/时间/MAC，再原子登记 `(keyId, nonce)`；nonce 状态必须有界、可持久化并与时间窗一起回收。

**最小示例：**

```java
if (!MessageDigest.isEqual(expectedMac, actualMac)) return false;
return replayStore.admit(keyId, nonce, expiresAt);
```

**运行结果：** 同一签名首次通过，第二次重放被拒绝；正文变化也不能复用签名。

**常见误区：** 只验 HMAC，不绑定 method/target/body 或不保存 nonce。

### PKCS12 只解决一种 key 容器问题

**它是什么：** PKCS12 KeyStore 可以保存 private key、secret key 与 trusted certificate entry。

**有什么作用：** 为本地 key/certificate 提供标准化容器和口令保护。

**什么时候使用：** 文件式 truststore/keystore 或兼容部署；高价值私钥仍优先使用 KMS/HSM。

**怎么使用：** 显式 `KeyStore.getInstance("PKCS12")`；分开治理 store password、entry password、文件权限、备份和进程读取权限；跨 Java 8/25 不依赖默认类型。

**最小示例：**

```java
KeyStore store = KeyStore.getInstance("PKCS12");
try (InputStream input = Files.newInputStream(path)) {
    store.load(input, storePassword);
}
```

**运行结果：** 两条运行时使用同一显式类型；错误口令或损坏文件会明确失败。

**常见误区：** 把 PKCS12 文件密码当成 HSM 等级隔离、自动轮换或不可导出保证。

### secret source、运行时暴露和轮换分开治理

**它是什么：** secret source 负责交付；应用配置负责最小绑定；轮换负责版本切换与旧值退役。

**有什么作用：** 避免 key、password、token 进入源码、镜像层、命令行、DTO、日志、异常和管理端点。

**什么时候使用：** 数据库凭据、API key、MAC key、加密 key 和签发私钥的整个生命周期。

**怎么使用：** 从受控 KMS/HSM/secret store 或只读挂载读取；配置只保存引用或最短生命周期值；按 `kid/version` 先发布新验证 key，再切换写入，最后在最大有效期后退役旧 key。

**最小示例：**

```properties
spring.config.import=optional:configtree:/run/secrets/
```

**运行结果：** Boot 4.1 可从文件导入属性，但权限、加密、刷新、脱敏和撤销仍由外部系统与应用合同完成。

**常见误区：** 认为环境变量或 `configtree:` 自动提供加密、RBAC、热轮换和 Actuator 脱敏。

### Bouncy Castle 扩展要锁 artifact、provider 与向量

**它是什么：** BC 为 JCA 提供额外算法实现；产品发布 1.85、artifact patch 1.85.2 和源码 tag `r1rv85v2` 是不同版本层次。

**有什么作用：** 在需要 SM2/SM3 等 provider 扩展时建立可复现能力边界。

**什么时候使用：** 标准 JDK provider 不提供目标算法，且协议已冻结曲线、user ID、signature encoding 和互操作向量时。

**怎么使用：** 固定 Maven 坐标与 provider name；启动时核对版本和注册名；用官方/标准向量覆盖正确、wrong-key、tamper 和跨实现互操作；不要从项目类名反推协议。

**最小示例：**

```java
Security.addProvider(new BouncyCastleProvider());
MessageDigest digest = MessageDigest.getInstance("SM3", "BC");
```

**运行结果：** 实际 provider 与算法可观测；缺依赖、错误版本或别名漂移会在启动/向量测试中失败。

**常见误区：** 只看 `SM2Util` 命名就声称曲线、编码、provider 版本和协议都正确。

### TLS 需要信任链和 endpoint identity 两层验证

**它是什么：** PKIX path validation 证明证书链到受信 anchor；endpoint identification 再把目标主机与证书 SAN 匹配。

**有什么作用：** 防止连接到证书有效但主机错误的端点，以及自签或伪造端点。

**什么时候使用：** HTTPS、raw `SSLSocket`、`SSLEngine` 和所有自定义 truststore 客户端。

**怎么使用：** 使用默认 trust manager 或窄 private-CA truststore；HTTPS 保留 hostname verifier；raw socket 设置 endpoint identification；测试 correct-host、wrong-host、untrusted 和 expired 证书。

**最小示例：**

```java
SSLParameters parameters = socket.getSSLParameters();
parameters.setEndpointIdentificationAlgorithm("HTTPS");
socket.setSSLParameters(parameters);
```

**运行结果：** 只有信任链和主机身份都通过的连接才能建立。

**常见误区：** trust manager 接受任意证书、hostname verifier 恒 true，或修改 JVM 全局 HTTPS defaults。

### 许可证验证是完整授权状态机

**它是什么：** 许可证验证依次处理结构、profile、key、canonical bytes、签名、产品/主体、时间、features、撤销和本地状态。

**有什么作用：** 把密码学真实性转换成当前环境可使用的最小授权对象。

**什么时候使用：** 离线许可证、功能开关、部署绑定和长期签名凭据。

**怎么使用：** 限制大小和格式；version/profile 走 allowlist；kid 只查本地受信公钥；完整验签后再检查 product、subject、notBefore/expiry、feature、key/license revocation、clock rollback；任何失败都不创建授权对象。

**最小示例：**

```java
Optional<Entitlements> verified = verifier.verify(envelope, clock, revocationState);
verified.orElseThrow(() -> new LicenseRejectedException("license rejected"));
```

**运行结果：** missing、unknown key、篡改、未来生效、过期、错误产品和撤销状态不可用都稳定拒绝。

**常见误区：** 把 `Signature.verify() == true` 直接当成永久且全功能授权。

## 现代版本中的正确用法

Java 25 主线使用完整 JCA transformation、`SecureRandom`、显式 `PKCS12`、Java 25 `KDF`/HKDF 和按用途固定的 provider。Spring Boot 4.1 的 `configtree:` 只承担外部文件到 property 的导入；秘密加密、访问控制、刷新、轮换、撤销和日志脱敏仍是独立责任。

Bouncy Castle 只有在协议确实需要 SM2/SM3 等扩展时才引入，并固定 `bcprov-jdk18on:1.85.2`、provider 名、算法参数和互操作向量。算法来自本地 profile，不来自 envelope、许可证或请求中的自由文本。

## 基本语法

```java
/** 使用显式 AES-GCM 合同完成一次认证加密。 */
byte[] encrypt(SecretKey key, byte[] nonce, byte[] aad, byte[] plaintext) throws Exception {
    Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
    cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(128, nonce));
    cipher.updateAAD(aad);
    return cipher.doFinal(plaintext);
}
```

`nonce` 可与密文一起保存，但同一 key 下不能重复。`aad` 不保密，却会被 tag 认证；解密端必须以相同 bytes、相同顺序在 ciphertext 前提供。

## 核心接口与完整示例

下面的程序只使用 Java 8 与 Java 25 共有的 JDK API。它在一个反馈环里覆盖 AES-GCM、canonical request HMAC、防重放和公钥许可证状态机。随机生成的 key 只存在于进程内且不输出；生产 key 必须来自受控秘密系统或受保护的 KeyStore/KMS/HSM。

```java
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.MessageDigest;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.SecureRandom;
import java.security.Signature;
import java.security.spec.ECGenParameterSpec;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.crypto.AEADBadTagException;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

/** 演示加密、请求签名与许可证校验的最小闭环。 */
public final class CryptoSecretsLicenseExample {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final long NOW = 1_786_622_400L;
    private static final long REQUEST_WINDOW_SECONDS = 60L;
    private static final String LICENSE_PROFILE = "ECDSA-P256-SHA256";

    /** 运行全部允许与拒绝路径。 */
    public static void main(String[] args) throws Exception {
        SecretKey encryptionKey = generateAesKey();
        SecretKey requestKey = generateHmacKey();
        KeyPair issuerKeys = generateIssuerKeys();

        KeyRegistry keys = new KeyRegistry();
        keys.encryption.put("enc-v1", encryptionKey);
        keys.requests.put("request-v1", requestKey);
        keys.licenses.put("license-v1", new VerificationKey("issuer-a", issuerKeys.getPublic()));

        NonceAllocator nonces = new NonceAllocator();
        byte[] aad = bytes("tenant-7|invoice-42|schema-1");
        Envelope envelope = encrypt(keys, nonces, "enc-v1", aad, bytes("amount=88"));
        Envelope second = encrypt(keys, nonces, "enc-v1", aad, bytes("amount=89"));
        require(!Arrays.equals(envelope.nonce, second.nonce), "per-key nonce uniqueness");
        require(Arrays.equals(bytes("amount=88"), decrypt(keys, envelope, aad)), "decrypt");
        require(rejectsTamper(keys, envelope, aad), "tampered ciphertext");
        require(rejectsUnknownEncryptionKey(keys, envelope, aad), "unknown encryption key");

        ReplayStore replay = new ReplayStore(1024);
        SignedRequest request = signRequest(
            keys, "request-v1", "POST", "/v1/orders/42", NOW, "nonce-1", bytes("paid"));
        require(verifyRequest(keys, replay, request, NOW), "valid request");
        require(!verifyRequest(keys, replay, request, NOW), "replay");
        require(!verifyRequest(keys, new ReplayStore(8), request.withBody(bytes("void")), NOW), "body");
        require(!verifyRequest(keys, new ReplayStore(8), request, NOW + 61L), "expired request");

        License license = signLicense(
            issuerKeys.getPrivate(),
            "license-v1",
            new LicensePayload("license-7", "issuer-a", "reporting-service", "customer-7",
                NOW - 10L, NOW - 1L, NOW + 3600L, 3, Arrays.asList("export", "search")));
        LicenseState licenseState = new LicenseState(true, Collections.<String>emptySet(),
            Collections.<String>emptySet());
        require(verifyLicense(keys, license, NOW, "reporting-service", "customer-7", "export",
            licenseState), "valid license");
        require(!verifyLicense(keys, license.withSignature(tamper(license.signature)), NOW,
            "reporting-service", "customer-7", "export", licenseState), "tampered license");
        require(!verifyLicense(keys, license, NOW + 3600L, "reporting-service", "customer-7",
            "export", licenseState), "expired license");
        require(!verifyLicense(keys, license.withFormatVersion(2), NOW, "reporting-service",
            "customer-7", "export", licenseState), "format version");
        require(!verifyLicense(keys, license.withKeyId("missing"), NOW, "reporting-service",
            "customer-7", "export", licenseState), "unknown license key");
        require(!verifyLicense(keys, null, NOW, "reporting-service", "customer-7", "export",
            licenseState), "missing license");
        require(!verifyLicense(keys, license.withPayload(null), NOW, "reporting-service",
            "customer-7", "export", licenseState), "missing payload");
        require(!verifyLicense(keys, license.withPayload(license.payload.withFeatures(null)), NOW,
            "reporting-service", "customer-7", "export", licenseState), "missing features");
        require(!verifyLicense(keys, license.withPayload(license.payload.withFeatures(
            Arrays.asList("export", null))), NOW, "reporting-service", "customer-7", "export",
            licenseState), "invalid feature");
        require(!verifyLicense(keys, license.withSignature(null), NOW, "reporting-service",
            "customer-7", "export", licenseState), "missing signature");
        require(!verifyLicense(keys, license, NOW, "reporting-service", "customer-7", "export",
            null), "missing license state");
        License wrongIssuer = signLicense(issuerKeys.getPrivate(), "license-v1",
            license.payload.withIssuer("issuer-b"));
        require(!verifyLicense(keys, wrongIssuer, NOW, "reporting-service", "customer-7", "export",
            licenseState), "issuer binding");
        License wrongVersion = signLicense(issuerKeys.getPrivate(), "license-v1",
            license.payload.withLicenseVersion(2));
        require(!verifyLicense(keys, wrongVersion, NOW, "reporting-service", "customer-7", "export",
            licenseState), "license version");
        require(!verifyLicense(keys, license, NOW, "reporting-service", "customer-7", "admin",
            licenseState), "feature gate");
        require(!verifyLicense(keys, license, NOW - 1L, "reporting-service", "customer-7", "export",
            licenseState), "clock rollback");
        LicenseState revokedLicense = new LicenseState(true, Collections.<String>emptySet(),
            Collections.singleton("license-7"));
        require(!verifyLicense(keys, license, NOW, "reporting-service", "customer-7", "export",
            revokedLicense), "revoked license");
        LicenseState revokedKey = new LicenseState(true, Collections.singleton("license-v1"),
            Collections.<String>emptySet());
        require(!verifyLicense(keys, license, NOW, "reporting-service", "customer-7", "export",
            revokedKey), "revoked key");
        LicenseState unavailable = new LicenseState(false, Collections.<String>emptySet(),
            Collections.<String>emptySet());
        require(!verifyLicense(keys, license, NOW, "reporting-service", "customer-7", "export",
            unavailable), "revocation unavailable");

        System.out.println(
            "CRYPTO_SECRETS_LICENSE_PASS decrypt=1 tampered=1 replay=1 expired=1 "
                + "unknownKey=1 missing=1"
        );
    }

    /** 生成 AES-256 数据加密密钥。 */
    private static SecretKey generateAesKey() throws GeneralSecurityException {
        KeyGenerator generator = KeyGenerator.getInstance("AES");
        generator.init(256, RANDOM);
        return generator.generateKey();
    }

    /** 生成 256-bit HMAC 密钥。 */
    private static SecretKey generateHmacKey() {
        byte[] value = new byte[32];
        RANDOM.nextBytes(value);
        return new SecretKeySpec(value, "HmacSHA256");
    }

    /** 生成现代主线使用的 P-256 许可证签发密钥对。 */
    private static KeyPair generateIssuerKeys() throws GeneralSecurityException {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("EC");
        generator.initialize(new ECGenParameterSpec("secp256r1"), RANDOM);
        return generator.generateKeyPair();
    }

    /** 使用 per-key allocator 和 AAD 完成 AES-GCM 加密。 */
    private static Envelope encrypt(KeyRegistry keys, NonceAllocator nonces, String keyId,
            byte[] aad, byte[] plaintext) throws GeneralSecurityException {
        byte[] nonce = nonces.next(keyId);
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, requireEncryptionKey(keys, keyId),
            new GCMParameterSpec(128, nonce));
        cipher.updateAAD(aad);
        return new Envelope(1, keyId, nonce, cipher.doFinal(plaintext));
    }

    /** 只有 tag 验证成功才返回 AES-GCM 明文。 */
    private static byte[] decrypt(KeyRegistry keys, Envelope envelope, byte[] aad)
            throws GeneralSecurityException {
        if (envelope.version != 1) throw new GeneralSecurityException("unsupported version");
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE, requireEncryptionKey(keys, envelope.keyId),
            new GCMParameterSpec(128, envelope.nonce));
        cipher.updateAAD(aad);
        return cipher.doFinal(envelope.ciphertext);
    }

    /** 从本地用途固定 registry 解析加密 key。 */
    private static SecretKey requireEncryptionKey(KeyRegistry keys, String keyId)
            throws GeneralSecurityException {
        SecretKey key = keys.encryption.get(keyId);
        if (key == null) throw new GeneralSecurityException("unknown encryption key");
        return key;
    }

    /** 验证密文篡改会被认证标签拒绝。 */
    private static boolean rejectsTamper(KeyRegistry keys, Envelope envelope, byte[] aad)
            throws GeneralSecurityException {
        try {
            decrypt(keys, envelope.withCiphertext(tamper(envelope.ciphertext)), aad);
            return false;
        } catch (AEADBadTagException expected) {
            return true;
        }
    }

    /** 验证未知 key ID 不会被动态解析。 */
    private static boolean rejectsUnknownEncryptionKey(
            KeyRegistry keys, Envelope envelope, byte[] aad) {
        try {
            decrypt(keys, envelope.withKeyId("missing"), aad);
            return false;
        } catch (GeneralSecurityException expected) {
            return true;
        }
    }

    /** 使用固定 canonical request 计算 HMAC。 */
    private static SignedRequest signRequest(KeyRegistry keys, String keyId, String method,
            String target, long timestamp, String nonce, byte[] body)
            throws GeneralSecurityException {
        SecretKey key = keys.requests.get(keyId);
        if (key == null) throw new GeneralSecurityException("unknown request key");
        byte[] signature = hmac(key, canonicalRequest(method, target, timestamp, nonce, body));
        return new SignedRequest(keyId, method, target, timestamp, nonce, body, signature);
    }

    /** 校验请求时间、MAC 与单次 nonce。 */
    private static boolean verifyRequest(
            KeyRegistry keys, ReplayStore replay, SignedRequest request, long now)
            throws GeneralSecurityException {
        SecretKey key = keys.requests.get(request.keyId);
        if (key == null || Math.abs(now - request.timestamp) > REQUEST_WINDOW_SECONDS) return false;
        byte[] expected = hmac(key, canonicalRequest(request.method, request.target,
            request.timestamp, request.nonce, request.body));
        return MessageDigest.isEqual(expected, request.signature)
            && replay.admit(request.keyId, request.nonce,
                request.timestamp + REQUEST_WINDOW_SECONDS, now);
    }

    /** 计算 HmacSHA256。 */
    private static byte[] hmac(SecretKey key, byte[] input) throws GeneralSecurityException {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(key);
        return mac.doFinal(input);
    }

    /** 按长度前缀编码请求字段与正文摘要。 */
    private static byte[] canonicalRequest(
            String method, String target, long timestamp, String nonce, byte[] body)
            throws GeneralSecurityException {
        return encodeFields(bytes(method), bytes(target), bytes(Long.toString(timestamp)),
            bytes(nonce), MessageDigest.getInstance("SHA-256").digest(body));
    }

    /** 使用发行端私钥签发 canonical 许可证 payload。 */
    private static License signLicense(PrivateKey key, String keyId, LicensePayload payload)
            throws GeneralSecurityException {
        License unsigned = new License(1, LICENSE_PROFILE, keyId, payload, new byte[0]);
        Signature signer = Signature.getInstance("SHA256withECDSA");
        signer.initSign(key, RANDOM);
        signer.update(unsigned.canonicalBytes());
        return unsigned.withSignature(signer.sign());
    }

    /** 按冻结顺序完成许可证全部 Gate，任何异常都拒绝。 */
    private static boolean verifyLicense(KeyRegistry keys, License license, long now,
            String product, String subject, String requiredFeature, LicenseState state) {
        if (keys == null || state == null || !textPresent(product) || !textPresent(subject)
                || !textPresent(requiredFeature) || !structurallyValid(license)) return false;
        if (license.formatVersion != 1 || !LICENSE_PROFILE.equals(license.algorithmProfile)) {
            return false;
        }
        VerificationKey registered = keys.licenses.get(license.keyId);
        if (registered == null) return false;
        LicensePayload payload = license.payload;
        try {
            byte[] canonical = license.canonicalBytes();
            if (canonical.length > 4096) return false;
            Signature verifier = Signature.getInstance("SHA256withECDSA");
            verifier.initVerify(registered.key);
            verifier.update(canonical);
            if (!verifier.verify(license.signature)) return false;
        } catch (GeneralSecurityException invalid) {
            return false;
        }
        if (!registered.issuer.equals(payload.issuer) || !product.equals(payload.product)
                || !subject.equals(payload.subject)) return false;
        if (payload.issuedAt > now || now < payload.notBefore || now >= payload.expiresAt) return false;
        if (!payload.features.contains(requiredFeature)) return false;
        return state.accept(license.keyId, payload.licenseId, now);
    }

    /** 检查解析后字段的数量、长度与业务版本。 */
    private static boolean structurallyValid(License license) {
        if (license == null || license.signature == null || license.signature.length == 0
                || license.signature.length > 256 || license.payload == null) {
            return false;
        }
        LicensePayload payload = license.payload;
        if (!textPresent(license.keyId) || !textPresent(payload.issuer)
                || !textPresent(payload.licenseId) || !textPresent(payload.product)
                || !textPresent(payload.subject) || payload.licenseVersion != 3
                || payload.features == null || payload.features.size() > 32) {
            return false;
        }
        for (String feature : payload.features) {
            if (!textPresent(feature)) return false;
        }
        return true;
    }

    /** 检查协议文本存在且有界。 */
    private static boolean textPresent(String value) {
        return value != null && !value.isEmpty() && value.length() <= 128;
    }

    /** 使用 UTF-8 编码协议文本。 */
    private static byte[] bytes(String value) {
        return value.getBytes(StandardCharsets.UTF_8);
    }

    /** 使用四字节长度前缀拼接无歧义字段。 */
    private static byte[] encodeFields(byte[]... fields) {
        int size = 0;
        for (byte[] field : fields) size += 4 + field.length;
        ByteBuffer buffer = ByteBuffer.allocate(size);
        for (byte[] field : fields) buffer.putInt(field.length).put(field);
        return buffer.array();
    }

    /** 复制并修改一个字节。 */
    private static byte[] tamper(byte[] input) {
        byte[] changed = Arrays.copyOf(input, input.length);
        changed[changed.length - 1] ^= 1;
        return changed;
    }

    /** 在反馈合同不成立时立即失败。 */
    private static void require(boolean condition, String name) {
        if (!condition) throw new IllegalStateException(name);
    }

    /** 保存用途隔离的本地 key registry。 */
    private static final class KeyRegistry {
        private final Map<String, SecretKey> encryption = new HashMap<String, SecretKey>();
        private final Map<String, SecretKey> requests = new HashMap<String, SecretKey>();
        private final Map<String, VerificationKey> licenses =
            new HashMap<String, VerificationKey>();
    }

    /** 保存签发者与用途固定的许可证公钥。 */
    private static final class VerificationKey {
        private final String issuer;
        private final PublicKey key;

        /** 冻结 issuer 与公钥绑定。 */
        private VerificationKey(String issuer, PublicKey key) {
            this.issuer = issuer;
            this.key = key;
        }
    }

    /** 为每个 key 分配随机前缀加单调计数器 nonce。 */
    private static final class NonceAllocator {
        private final Map<String, byte[]> prefixes = new HashMap<String, byte[]>();
        private final Map<String, Long> counters = new HashMap<String, Long>();

        /** 原子分配当前实例内不重复的 96-bit nonce；生产实现需持久化前缀和计数器。 */
        private synchronized byte[] next(String keyId) throws GeneralSecurityException {
            byte[] prefix = prefixes.get(keyId);
            if (prefix == null) {
                prefix = new byte[4];
                RANDOM.nextBytes(prefix);
                prefixes.put(keyId, prefix);
            }
            long next = counters.containsKey(keyId) ? counters.get(keyId) + 1L : 1L;
            if (next <= 0L) throw new GeneralSecurityException("nonce space exhausted");
            counters.put(keyId, next);
            return ByteBuffer.allocate(12).put(prefix).putLong(next).array();
        }
    }

    /** 保存版本化 AES-GCM envelope。 */
    private static final class Envelope {
        private final int version;
        private final String keyId;
        private final byte[] nonce;
        private final byte[] ciphertext;

        /** 防御性复制全部二进制字段。 */
        private Envelope(int version, String keyId, byte[] nonce, byte[] ciphertext) {
            this.version = version;
            this.keyId = keyId;
            this.nonce = Arrays.copyOf(nonce, nonce.length);
            this.ciphertext = Arrays.copyOf(ciphertext, ciphertext.length);
        }

        /** 构造用于负向验证的未知 key envelope。 */
        private Envelope withKeyId(String value) {
            return new Envelope(version, value, nonce, ciphertext);
        }

        /** 构造用于负向验证的篡改密文 envelope。 */
        private Envelope withCiphertext(byte[] value) {
            return new Envelope(version, keyId, nonce, value);
        }
    }

    /** 保存 canonical request 与 HMAC。 */
    private static final class SignedRequest {
        private final String keyId;
        private final String method;
        private final String target;
        private final long timestamp;
        private final String nonce;
        private final byte[] body;
        private final byte[] signature;

        /** 防御性复制请求二进制字段。 */
        private SignedRequest(String keyId, String method, String target, long timestamp,
                String nonce, byte[] body, byte[] signature) {
            this.keyId = keyId;
            this.method = method;
            this.target = target;
            this.timestamp = timestamp;
            this.nonce = nonce;
            this.body = Arrays.copyOf(body, body.length);
            this.signature = Arrays.copyOf(signature, signature.length);
        }

        /** 构造用于负向验证的变更正文请求。 */
        private SignedRequest withBody(byte[] value) {
            return new SignedRequest(keyId, method, target, timestamp, nonce, value, signature);
        }
    }

    /** 演示原子、有 TTL 和容量上限的 replay store；生产实现需跨重启、跨节点共享。 */
    private static final class ReplayStore {
        private final int capacity;
        private final Map<String, Long> expiresAt = new HashMap<String, Long>();

        /** 创建固定容量 replay store。 */
        private ReplayStore(int capacity) {
            this.capacity = capacity;
        }

        /** 清理过期记录并原子登记首次出现的 nonce。 */
        private synchronized boolean admit(String keyId, String nonce, long expiry, long now) {
            java.util.Iterator<Map.Entry<String, Long>> entries = expiresAt.entrySet().iterator();
            while (entries.hasNext()) if (entries.next().getValue() < now) entries.remove();
            String replayKey = keyId + "\n" + nonce;
            if (expiresAt.containsKey(replayKey) || expiresAt.size() >= capacity) return false;
            expiresAt.put(replayKey, expiry);
            return true;
        }
    }

    /** 保存许可证业务字段与唯一 canonical form。 */
    private static final class LicensePayload {
        private final String licenseId;
        private final String issuer;
        private final String product;
        private final String subject;
        private final long issuedAt;
        private final long notBefore;
        private final long expiresAt;
        private final int licenseVersion;
        private final List<String> features;

        /** 复制并冻结功能集合，排序留给 canonical 编码。 */
        private LicensePayload(String licenseId, String issuer, String product, String subject,
                long issuedAt, long notBefore, long expiresAt, int licenseVersion,
                List<String> features) {
            this.licenseId = licenseId;
            this.issuer = issuer;
            this.product = product;
            this.subject = subject;
            this.issuedAt = issuedAt;
            this.notBefore = notBefore;
            this.expiresAt = expiresAt;
            this.licenseVersion = licenseVersion;
            this.features = features == null ? null
                : Collections.unmodifiableList(new java.util.ArrayList<String>(features));
        }

        /** 按长度前缀编码全部许可证字段。 */
        private byte[] canonicalBytes() {
            List<byte[]> fields = new java.util.ArrayList<byte[]>();
            fields.add(bytes(licenseId));
            fields.add(bytes(issuer));
            fields.add(bytes(product));
            fields.add(bytes(subject));
            fields.add(bytes(Long.toString(issuedAt)));
            fields.add(bytes(Long.toString(notBefore)));
            fields.add(bytes(Long.toString(expiresAt)));
            fields.add(bytes(Integer.toString(licenseVersion)));
            List<String> sortedFeatures = new java.util.ArrayList<String>(features);
            Collections.sort(sortedFeatures);
            for (String feature : sortedFeatures) fields.add(bytes(feature));
            return encodeFields(fields.toArray(new byte[fields.size()][]));
        }

        /** 构造用于负向验证的 issuer payload。 */
        private LicensePayload withIssuer(String value) {
            return new LicensePayload(licenseId, value, product, subject, issuedAt, notBefore,
                expiresAt, licenseVersion, features);
        }

        /** 构造用于负向验证的业务版本 payload。 */
        private LicensePayload withLicenseVersion(int value) {
            return new LicensePayload(licenseId, issuer, product, subject, issuedAt, notBefore,
                expiresAt, value, features);
        }

        /** 构造用于负向验证的功能集合 payload。 */
        private LicensePayload withFeatures(List<String> value) {
            return new LicensePayload(licenseId, issuer, product, subject, issuedAt, notBefore,
                expiresAt, licenseVersion, value);
        }
    }

    /** 保存许可证 envelope、payload 与签名。 */
    private static final class License {
        private final int formatVersion;
        private final String algorithmProfile;
        private final String keyId;
        private final LicensePayload payload;
        private final byte[] signature;

        /** 防御性复制签名字节。 */
        private License(int formatVersion, String algorithmProfile, String keyId,
                LicensePayload payload, byte[] signature) {
            this.formatVersion = formatVersion;
            this.algorithmProfile = algorithmProfile;
            this.keyId = keyId;
            this.payload = payload;
            this.signature = signature == null ? null : Arrays.copyOf(signature, signature.length);
        }

        /** 生成包含 envelope 和 payload 的唯一签名字节。 */
        private byte[] canonicalBytes() {
            return encodeFields(bytes(Integer.toString(formatVersion)), bytes(algorithmProfile),
                bytes(keyId), payload.canonicalBytes());
        }

        /** 构造用于负向验证的未知 key 许可证。 */
        private License withKeyId(String value) {
            return new License(formatVersion, algorithmProfile, value, payload, signature);
        }

        /** 构造用于负向验证的格式版本许可证。 */
        private License withFormatVersion(int value) {
            return new License(value, algorithmProfile, keyId, payload, signature);
        }

        /** 构造用于负向验证的篡改签名许可证。 */
        private License withSignature(byte[] value) {
            return new License(formatVersion, algorithmProfile, keyId, payload, value);
        }

        /** 构造用于负向验证的 payload。 */
        private License withPayload(LicensePayload value) {
            return new License(formatVersion, algorithmProfile, keyId, value, signature);
        }
    }

    /** 保存受信撤销状态与本地单调时间。 */
    private static final class LicenseState {
        private final boolean available;
        private final Set<String> revokedKeys;
        private final Set<String> revokedLicenses;
        private long lastSeenTime;

        /** 创建 fail-closed 许可证状态。 */
        private LicenseState(boolean available, Set<String> revokedKeys,
                Set<String> revokedLicenses) {
            this.available = available;
            this.revokedKeys = new HashSet<String>(revokedKeys);
            this.revokedLicenses = new HashSet<String>(revokedLicenses);
        }

        /** 原子检查撤销与 rollback，并只在通过时推进单调时间。 */
        private synchronized boolean accept(String keyId, String licenseId, long now) {
            if (!available || revokedKeys.contains(keyId) || revokedLicenses.contains(licenseId)
                    || now < lastSeenTime) return false;
            lastSeenTime = now;
            return true;
        }
    }
}
```

程序只在所有允许与拒绝路径符合合同时输出：

```text
CRYPTO_SECRETS_LICENSE_PASS decrypt=1 tampered=1 replay=1 expired=1 unknownKey=1 missing=1
```

## 从零跟着做

1. 先列出数据机密性、请求认证和许可证授权三种不同目标。
2. 为每种目标建立独立 key purpose、registry、algorithm profile 和 rotation window。
3. 为 AES-GCM 冻结 envelope、nonce allocator、AAD 和失败不发布明文规则。
4. 为 HMAC/签名冻结 canonical bytes，覆盖 tamper、wrong key、过期和 replay。
5. 最后加入许可证 product、subject、feature、time、revocation 与状态不可用 Gate。
6. 在两套支持运行时提取并运行同一正文示例，不在仓库保留 key、测试或构建产物。

## 如何使用

把密码学原语放在窄模块里：调用方只提交受控 profile、key ID 和业务上下文，不直接拼 transformation。解密模块只在 tag 完整通过后返回明文；许可证模块只在所有 Gate 通过后返回不可变 entitlements。所有失败对外使用稳定分类，对内记录不含 secret、private key、payload 或 signature bytes 的审计字段。

## 适用与不适用场景

:::tip
JCA 适合建立本地可验证的密码学原语；KMS/HSM/secret manager 适合高价值 key 的生成、访问控制和轮换。离线许可证适合可接受有限撤销延迟的部署，不适合把持续在线高风险授权完全搬到客户端。TLS 负责传输身份和机密性，不替代消息级重放防护或资源授权。
:::

## 当前项目补充

冻结矩阵只证明项目存在 JCA/JCE、摘要/MAC/签名、SM2/SM3/BC 候选和敏感配置处理能力。正文中的 observed `AESUtils`、`JzRSAUtils`、`HMacUtils`、`SM2Util`、`License` 与 `DataSourceConfig` 只支持“存在该能力面”，不能证明具体 algorithm、provider、key 管理、TLS 或许可证状态机正确。

`JAVA-RISK-015/016/019/020` 只作为研究中的 rejected/corrected 风险证据：不能复制硬编码 key、弱算法、trust-all、非安全随机或 fail-open 路径，也不能从冻结类名断言实际漏洞。本文没有读取、运行或修改外部项目源码。

## Java 8 / Spring Boot 2.3 兼容写法

Java 8 已有 `SecureRandom`、PBKDF2、AES-GCM、`GCMParameterSpec`、`Mac`、`Signature`、PKCS12 和 JSSE，因此完整示例可在 Java 8/25 同源运行。Java 8 没有标准 `DRBG`/`DrbgParameters` 和 `javax.crypto.KDF`/HKDF；需要 HKDF 时固定第三方实现/provider 并用 RFC 5869 向量验证，不能把 Java 25 API 复制到旧线。

Boot 2.3.12 使用其归档文档支持的环境变量、外部文件或专用秘密集成。`spring.config.import=configtree:` 属于 Boot 2.4+ Config Data，不是 Boot 2.3 合同。跨 Java 8/25 的 keystore 代码显式写 `PKCS12`，不使用随版本改变的默认类型。

## 新旧版本差异

Java 25 增加标准 KDF/HKDF 与 DRBG 参数 API；Java 8 只有传统 JCA 随机、PBE 与 provider 能力。Boot 4.1 可用 Config Data `configtree:`，Boot 2.3.12 不可原样使用。BC `bcprov-jdk18on:1.85.2` 声明 Java 8+，但引入后仍须在两条运行时锁 provider/version/algorithm/vector，不能据此声称冻结项目使用该版本。

## 易错点

:::pitfalls
### 错误：依赖默认 transformation 或输入选择算法

**触发条件：** 使用 `Cipher.getInstance("AES")`，或直接读取请求中的 algorithm/provider。

**原因：** mode、padding 和 provider 关键语义没有冻结。

**后果：** provider 漂移、弱模式、算法混淆或跨环境不互操作。

**错误示例：**

```java
Cipher.getInstance(request.getParameter("algorithm"));
```

**正确写法：**

```java
Cipher.getInstance("AES/GCM/NoPadding");
```

**影响版本：** Java 8 与 25 的所有 JCA provider。

**验证方式：** 未知 profile/provider 明确失败；两条运行时记录实际 transformation/provider 并跑向量。

**来源：** `jdk25-jca-guide`、`jdk25-cipher`、`jdk25-providers`。

### 错误：用非安全随机数生成安全值

**触发条件：** 用 `Random`、`Math.random()`、时间戳、UUID 截断或固定 seed 生成 key、nonce、token、salt。

**原因：** 输出可能可预测、重复或熵不足。

**后果：** token 可猜、key 变弱、GCM nonce 重用。

**错误示例：**

```java
new Random(1).nextBytes(nonce);
```

**正确写法：**

```java
secureRandom.nextBytes(nonce); // 另由 per-key allocator 保证不重复
```

**影响版本：** Java 8 与 25。

**验证方式：** 核对 API/provider、长度、并发与重启后的 allocator 状态；不以分布测试证明安全。

**来源：** `jdk25-secure-random`、`cwe-330-insufficient-randomness`、`nist-sp800-90a-r1`。

### 错误：混淆 DRBG、strong instance 与阻塞保证

**触发条件：** 把 `getInstanceStrong()`、DRBG、prediction resistance 和“永不阻塞”当成同义词。

**原因：** algorithm/provider、strength、capability、reseed 和系统熵来源是独立参数。

**后果：** 请求线程意外阻塞、错误强度假设或无效低熵重播种。

**错误示例：**

```java
SecureRandom random = SecureRandom.getInstanceStrong();
random.setSeed(timestamp);
```

**正确写法：**

```java
SecureRandom random = configuredSecureRandom;
```

**影响版本：** DRBG 参数 API 仅 Java 9+；Java 8 需按实际 provider 核验。

**验证方式：** 输出非秘密的 algorithm/provider/capability，测量初始化和生成延迟并覆盖 reseed 失败。

**来源：** `jdk25-secure-random`、`jdk25-drbg-parameters`、`nist-sp800-90a-r1`。

### 错误：把密码直接变成数据 key

**触发条件：** 截断、补零或快速 SHA-256 后直接作为 AES key，或用快速 digest 存密码。

**原因：** 人类密码低熵，普通 digest 没有可调 work factor。

**后果：** 离线穷举、共享 key、无法升级成本和错误可逆性假设。

**错误示例：**

```java
SecretKey key = new SecretKeySpec(password.getBytes(UTF_8), "AES");
```

**正确写法：**

```java
PBEKeySpec spec = new PBEKeySpec(passwordChars, salt, iterations, 256);
```

**影响版本：** Java 8 与 25。

**验证方式：** 不同 salt 结果不同；wrong password 失败；成本可升级且临时 password buffer 被清理。

**来源：** `nist-800-63b-passwords`、`nist-sp800-132`、`rfc8018-pkcs5`、`jdk25-pbe-key-spec`。

### 错误：把 HKDF 当 password hashing 或复制到 Java 8

**触发条件：** 用 HKDF 保存人类密码，或旧线直接引用 Java 25 `javax.crypto.KDF`。

**原因：** HKDF 面向高熵 IKM 的 extract/expand，没有密码穷举成本；Java 8 没有标准 KDF API。

**后果：** 密码验证值易穷举，或旧运行时无法编译/运行。

**错误示例：**

```java
KDF.getInstance("HKDF-SHA256"); // Java 8 共用源码无法编译
```

**正确写法：**

```java
byte[] subKey = verifiedHkdf.derive(highEntropyIkm, salt, domainInfo);
```

**影响版本：** 标准 KDF/HKDF 为 Java 25；Java 8 无此 API。

**验证方式：** Java 25 跑固定 HKDF 向量；Java 8 编译面不包含 `javax.crypto.KDF`。

**来源：** `openjdk-jep510-kdf`、`jdk25-kdf`、`jdk25-hkdf-parameter-spec`、`rfc5869-hkdf`。

### 错误：同一 GCM key 重用 nonce

**触发条件：** 固定 nonce、随机空间太小、计数器重启回退或并发重复分配。

**原因：** GCM 安全证明要求每把 key 下 IV 唯一。

**后果：** 泄露明文关系并可能允许伪造认证标签。

**错误示例：**

```java
byte[] nonce = new byte[12];
```

**正确写法：**

```java
byte[] nonce = nonceAllocator.next(keyId);
```

**影响版本：** Java 8 与 25 的 AES-GCM。

**验证方式：** 并发、重启、回滚和 key rotation 下均不重复；记录调用量但不记录 nonce/key 原值。

**来源：** `nist-sp800-38d`、`rfc5116-aead`、`jdk25-gcm-parameter-spec`。

### 错误：AAD 顺序不一致或 tag 失败仍用明文

**触发条件：** 在 ciphertext 后调用 `updateAAD`、两端编码不同、捕获 tag 异常后返回 buffer。

**原因：** AEAD 认证的是精确 AAD/ciphertext bytes，plaintext 只有 `doFinal` 成功后可信。

**后果：** 跨租户替换、认证绕过或未认证数据进入业务。

**错误示例：**

```java
catch (AEADBadTagException invalid) { return partialPlaintext; }
```

**正确写法：**

```java
cipher.updateAAD(canonicalAad);
return cipher.doFinal(ciphertextAndTag);
```

**影响版本：** Java 8 与 25。

**验证方式：** wrong AAD/key/nonce/tag、截断密文和未知 version 全部得到同一拒绝分类。

**来源：** `jdk25-cipher`、`rfc5116-aead`、`nist-sp800-38d`。

### 错误：用 digest 或 HMAC 代替发行方签名

**触发条件：** 用 SHA-256 摘要认证消息，或在所有客户端嵌入许可证 HMAC secret。

**原因：** digest 无 secret；所有 MAC verifier 都能生成有效 MAC。

**后果：** 摘要可被同时替换，或客户端可自行伪造许可证。

**错误示例：**

```java
boolean valid = Arrays.equals(digest(payload), providedDigest);
```

**正确写法：**

```java
verifier.initVerify(trustedIssuerPublicKey);
boolean valid = verifier.verify(signatureBytes);
```

**影响版本：** Java 8 与 25。

**验证方式：** public key 只能 verify；tampered payload/signature 与 wrong key 全部拒绝。

**来源：** `jdk25-message-digest`、`jdk25-mac`、`jdk25-signature`。

### 错误：对普通 JSON 重新序列化后验签

**触发条件：** 签发端和验证端依赖 serializer 默认字段顺序、数字或时间格式。

**原因：** JSON 对象语义没有定义唯一 bytes。

**后果：** 合法对象跨实现失败，或 unknown/duplicate field 产生语义分歧。

**错误示例：**

```java
signature.update(objectMapper.writeValueAsBytes(object));
```

**正确写法：**

```java
signature.update(canonicalProfile.encode(validatedPayload));
```

**影响版本：** 与 Java 版本无关的协议边界。

**验证方式：** 字段输入顺序变化仍得同一 canonical bytes；数值/类型/unknown field 变化按 profile 拒绝。

**来源：** `rfc8785-json-canonicalization`、`rfc7515-jws`。

### 错误：信任输入中的 alg、kid、version 或 provider

**触发条件：** 用 header/payload 拼 URL、文件路径、算法、provider 或动态 key 来源。

**原因：** 这些字段来自未验证输入，只能作为本地 allowlist 的查找提示。

**后果：** 算法混淆、SSRF、任意文件读取或错误 key 信任。

**错误示例：**

```java
PublicKey key = loadKey(new URL(payload.kid()));
```

**正确写法：**

```java
PublicKey key = trustedLicenseKeys.require(payload.kid());
```

**影响版本：** 所有签名、MAC、AEAD 和许可证实现。

**验证方式：** unknown/过长/path-like kid、未知 version 和不匹配算法稳定拒绝且不发网络请求。

**来源：** `rfc8725-jwt-bcp`、`rfc7515-jws`、`cwe-347-signature-verification`。

### 错误：秘密进入源码、String、日志或管理端点

**触发条件：** key/password/token 写进源码、默认配置、DTO、异常、`toString()`、env/configprops 输出。

**原因：** secret 生命周期和可见范围没有最小化。

**后果：** Git、镜像、日志、heap、备份和管理面形成长期副本。

**错误示例：**

```java
log.info("key={}", Base64.getEncoder().encodeToString(key.getEncoded()));
```

**正确写法：**

```java
log.info("crypto outcome={} keyId={}", outcome, keyId);
```

**影响版本：** Java 8/25，Boot 2.3/4.1。

**验证方式：** 扫描源码、构建产物、日志、异常和 Actuator 响应，确认没有 secret/key material。

**来源：** `cwe-321-hard-coded-key`、`spring-boot-410-actuator-sanitization`、`nist-sp800-57-part1-r5`。

### 错误：依赖默认 KeyStore type 或把 PKCS12 当 HSM

**触发条件：** 跨 Java 8/25 调用 `KeyStore.getDefaultType()`，或认为文件密码保证不可导出和自动轮换。

**原因：** JDK 9 改过默认类型；PKCS12 仍由进程和文件权限控制。

**后果：** 兼容失败、错误容器、私钥被普通进程读取或轮换责任遗失。

**错误示例：**

```java
KeyStore store = KeyStore.getInstance(KeyStore.getDefaultType());
```

**正确写法：**

```java
KeyStore store = KeyStore.getInstance("PKCS12");
```

**影响版本：** Java 8 默认 JKS，JDK 9+ 默认 PKCS12。

**验证方式：** 两条运行时加载同一显式类型；wrong password、损坏文件、权限和 rotation path 均覆盖。

**来源：** `jdk25-key-store`、`jdk8-key-store`、`openjdk-jep229-pkcs12-default`。

### 错误：关闭 TLS trust 或 hostname 验证

**触发条件：** accept-all trust manager、恒 true hostname verifier，或修改 JVM 全局 HTTPS defaults。

**原因：** 把“加密握手成功”误当成服务端身份已验证。

**后果：** 中间人端点可读取和修改凭据、密文或许可证状态。

**错误示例：**

```java
connection.setHostnameVerifier((hostname, session) -> true);
```

**正确写法：**

```java
parameters.setEndpointIdentificationAlgorithm("HTTPS");
```

**影响版本：** Java 8 与 25 JSSE。

**验证方式：** trusted-correct-host 通过；wrong-host、untrusted、expired/revoked 证书全部拒绝。

**来源：** `rfc9525-tls-service-identity`、`jdk25-jsse-guide`、`jdk25-ssl-parameters`、`cwe-295-certificate-validation`。

### 错误：许可证只验签或异常时 fail-open

**触发条件：** 漏验 product/subject/time/features/revocation，或 missing、网络/时钟异常时继续授权。

**原因：** 将 cryptographic proof 误当完整业务授权。

**后果：** 过期、跨产品、已撤销或缺失许可证仍解锁功能。

**错误示例：**

```java
return license == null || signature.verify(bytes);
```

**正确写法：**

```java
return licenseVerifier.verifyAllGates(license).isPresent();
```

**影响版本：** 与 Java 版本无关；两条运行时都需 fail-closed。

**验证方式：** valid、tamper、wrong product/subject、future/expired、unknown/revoked key/license、状态不可用全部覆盖。

**来源：** `jdk25-signature`、`rfc8725-jwt-bcp`、`cwe-347-signature-verification`、`cwe-636-fail-open`。
:::

## 错误与正确写法对比

:::compare
### 错误写法

```text
Cipher.getInstance("AES")
Random 生成 nonce
password 直接作为 AES key
对象重新 JSON 序列化后验签
kid 动态下载 key
trust-all 解决测试证书
Signature.verify=true 就永久授权
```

### 正确写法

```text
固定 engine/transformation/key/parameters/provider policy
SecureRandom 加 per-key nonce 唯一性状态
专用 password hashing 或版本化 PBKDF2/PBE；HKDF 只处理高熵 IKM
固定 canonical bytes、字段与编码 profile
kid 只查本地用途隔离 key registry
窄 truststore 加 endpoint identity
验签后继续 product/subject/time/features/revocation/local-state Gate
```
:::

## 安全注意

禁止在源码、测试、配置默认值、命令行、日志、异常、遥测、截图或 signoff 中保存 secret、private key、password、token 或许可证原文。对外错误不区分 wrong key、tag、AAD 或内部 provider 细节。key rotation、撤销状态和时钟不可用必须按风险选择 fail-closed；高风险功能不能把网络故障解释成永久授权。

## 性能注意

密码哈希成本、KMS/HSM 调用、provider 初始化、证书路径、撤销查询和签名验证需要分别测量。缓存只保存用途固定、版本化且有界的 public key/metadata；不要缓存 plaintext、private key encoded bytes 或无限 nonce。性能优化不能重用 GCM nonce、降低 password work factor 或跳过撤销/TLS 验证。

## 如何验证

1. 从本文提取 `CryptoSecretsLicenseExample`，在 Java 25 与 Java 8 各编译并连续运行两次。
2. AES-GCM 覆盖 round-trip、wrong key/AAD/nonce/tag、截断密文、unknown version/kid，失败无 plaintext。
3. 请求 HMAC 覆盖 method/target/body/timestamp/nonce 变化和原子 replay 拒绝。
4. 许可证覆盖 missing、tamper、wrong product/subject/feature、future/expired、unknown/revoked key/license、状态不可用。
5. PKCS12、BC 与 TLS 使用 `/tmp` 临时 fixture，分别验证双运行时、固定向量和四类证书负路径。
6. 扫描标准输出、日志、构建产物和浏览器页面，确认没有 secret、key material 或许可证原文。
7. 所有 fixture、key、keystore、证书、截图和运行产物只在精确 `/tmp` 目录存在，完成后删除并确认不存在。

:::exercise
### 练习：设计可轮换的许可证与数据加密协议

**要求：** 设计一个同时支持 AES-GCM 数据加密和离线许可证的 envelope。列出 version、key ID、nonce、AAD、canonical payload、product、subject、features、notBefore、expiresAt 和 revocation state；画出 old/new key 的发布、切换、read-old/write-new、退役顺序；为 unknown key、tag tamper、clock rollback、状态不可用和证书 wrong-host 写出预期结果。

**验收：** 算法只由本地 profile 决定；每把 key 下 nonce 不重复；私钥不进入 verifier；任何 AES-GCM 或许可证 Gate 失败都不产生 plaintext/entitlements；Java 8 隔离线不引用 Java 25 KDF/DRBG API。
:::

## 本节小结

- JCA 安全来自 engine、algorithm、key、parameters 与 provider policy 的完整合同。
- `SecureRandom` 不替代 GCM per-key nonce 唯一性；DRBG 的强度、capability、reseed 和阻塞要分开核验。
- password hashing、PBKDF2/PBE 和 HKDF 解决不同问题，Java 25/8 API 边界必须隔离。
- AES-GCM 只有 tag 完整通过后才能发布明文，version/kid 只映射本地 allowlist。
- digest、MAC 与 signature 的 key 模型不同，canonical bytes 是认证协议的一部分。
- PKCS12、secret source、Boot configtree、KMS/HSM 和 rotation 各自解决不同生命周期问题。
- TLS 同时需要可信证书路径和 endpoint identity，禁止 trust-all 与全局默认覆盖。
- 许可证验签只是状态机中间一步；绑定、时间、features、撤销和状态不可用都必须 fail-closed。
