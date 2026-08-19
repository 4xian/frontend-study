# Java 高级第 13 门：密码学 API、秘密管理、签名与许可证校验研究

> 课程 ID：`backend.java.learn.advanced.cryptography-secrets-and-license-verification`
>
> 冻结顺序：620
>
> 研究日期：2026-08-13
>
> 冻结快照：`dzzz-app-20260803-179e722831ab`
> 边界：只使用 Phase 2 冻结矩阵/清单和本稿核验的官方资料；不读取、运行或修改 `dzzz-app`。

## 冻结课程合同

- 标题：密码学 API、秘密管理、签名与许可证校验。
- 阶段：`advanced`，深度：`lesson`，课程顺序：`620`。
- 前置课程：
  1. `backend.java.learn.basics.strings-encoding-and-text-matching`。
  2. `backend.java.learn.advanced.authentication-authorization-and-jwt`。
- 来源能力只能覆盖：
  1. `JAVA-STDLIB-027`：JCA/JCE、`Cipher` 与密钥 API。
  2. `JAVA-STDLIB-028`：`MessageDigest`、`Mac` 与 `Signature`。
  3. `JAVA-FRAMEWORK-034`：SM2、SM3 与 Bouncy Castle。
  4. `JAVA-ENGINEERING-026`：凭据、签名与敏感数据处理。
  5. `JAVA-RISK-015`：凭据模型、回显与生命周期过宽。
  6. `JAVA-RISK-016`：源码硬编码秘密与不可轮换凭据。
  7. `JAVA-RISK-019`：令牌、签名与许可证校验未闭环或 fail-open。
  8. `JAVA-RISK-020`：弱密码学、不安全 TLS 与非安全随机数。
- 选择理由：项目存在多种密码学和凭据处理；旧算法、硬编码秘密、TLS 绕过和 fail-open 只作纠错。
- 冻结处置为 `JAVA-STDLIB-027: lesson`，其余七项为 `merged`。前四项 evidence policy 是
  `project-observed-capability`；四个 `JAVA-RISK-*` 都是 `project-risk-evidence-only`，只能作为研究审计与
  纠错边界，不能成为正文项目证据。
- 冻结状态保持 `researchStatus: not-started`、`exampleStatus: not-started`、
  `courseStatus: planned`。本稿不修改矩阵、正文、track、loader、signoff、测试或依赖。

## 研究范围与版本基线

### 现代主线

- Java 25 是课程语言与标准库基线；当前反馈环运行时记录为 Homebrew OpenJDK `25.0.4`。JDK 25 于
  2025-09-16 GA；补丁会漂移，正文只锁 Java 25 线，验证时记录实际 `java -version`。
- JDK 25 的 JCA 是 engine/provider 架构。`Cipher` transformation、算法、key 类型/长度、参数、provider
  能力和安全策略是不同边界；不得把 `getInstance` 成功等同于参数安全或跨 provider 行为相同。
- JDK 25 正式交付 `javax.crypto.KDF` 与 HKDF；PBKDF2 仍走 `SecretKeyFactory`。人类密码存储、从高熵
  key material 派生子密钥、用口令加密数据是三个用途，不共享一套参数或 API 结论。
- 对称加密主线采用 `AES/GCM/NoPadding`，每个 key 下 nonce/IV 必须唯一，AAD 必须在 ciphertext 前提供，
  解密只有 `doFinal` 完整验证 tag 后才允许使用 plaintext。
- Bouncy Castle 普通 Java 产品发布为 1.85；可解析 provider patch 固定为
  `org.bouncycastle:bcprov-jdk18on:1.85.2`。该 artifact 声明 Java 8+，固定源码 tag `r1rv85v2` 可核验
  SM2/SM3 provider 注册。冻结矩阵没有项目 artifact/version，不能反推冻结项目使用 1.85.2。
- Spring Boot 4.1.0 / Spring Framework 7.0.8 用于外部配置与 `configtree:`。外部化只是来源与覆盖机制，
  不自动提供加密、访问控制、轮换、审计脱敏或撤销。

### Legacy 隔离线

- Java 8、Spring Boot 2.3.12.RELEASE、Spring Framework 5.2.15.RELEASE；实际兼容运行时记录为
  Zulu `8u502-b07`。
- Java 8 已有 JCA/JCE、`SecureRandom`、AES-GCM、`GCMParameterSpec`、PBKDF2、`KeyStore`、PKCS12 与
  JSSE；没有标准 `DRBG`/`DrbgParameters`，也没有 Java 25 的 `KDF`/HKDF API。
- JDK 9 才把默认 keystore type 从 JKS 改为 PKCS12；跨 Java 8/25 读取时应显式指定 `PKCS12`，不能依赖
  `KeyStore.getDefaultType()`。Java 8 支持 PKCS12 不等于它默认创建 PKCS12。
- Boot 2.3.12 的传统 external config 没有 Boot 2.4 Config Data 的 `spring.config.import=configtree:` 合同；
  旧线须使用其实际支持的环境变量/外部文件或专用秘密集成，不能原样复制 Boot 4.1 配置。
- DES/3DES、MD5、SHA-1、RSA PKCS#1 v1.5、trust-all 与可预测随机数只作迁移/拒绝示例；“Java 8 支持”
  不等于现代安全推荐。

## 外部搜索与直接核验说明

- 按仓库顺位先用 Tavily 搜索 Oracle/OpenJDK、NIST、Spring、Bouncy Castle、RFC Editor 与 MITRE 官方
  候选；搜索摘要只用于发现 URL。结论均回到固定 JDK 版本页、JEP、固定 Spring tag、固定 BC artifact/tag、
  NIST publication、RFC 或 CWE 直接核验。
- 本稿共有 56 个唯一官方直接 URL；`verifiedAt` 均为 `2026-08-13`。固定 Java 25/8 API、JEP、RFC、
  NIST publication、Spring tag、BC release/artifact/tag 的 `driftRisk` 为 low；CWE living page 为 medium。
- 官网 Bouncy Castle 产品 release 与 Maven provider patch 分开记录；不把官网 1.85 发布页误写成 artifact
  `1.85.2` 的 release note，也不把 Maven metadata 的 latest 反推为冻结项目版本。
- Tavily 已提供足够的官方候选，没有进入 Exa、Parallel、Perplexity 或原生 web search。

## 已核验的官方来源卡

### Java 25 JCA、随机数、KDF 与密钥

1. **`openjdk-25`**
   - URL：<https://openjdk.org/projects/jdk/25/>。
   - `sourceType: release-note`；`appliesTo: JDK 25`；`verifiedAt: 2026-08-13`。
   - `claims`：JDK 25 于 2025-09-16 GA；课程锁定 Java 25 线但不锁漂移的 25u 补丁。
   - `driftRisk: low`。
2. **`jdk25-jca-guide`**
   - URL：<https://docs.oracle.com/en/java/javase/25/security/java-cryptography-architecture-jca-reference-guide.html>。
   - `sourceType: official-reference`；`appliesTo: Java 25 JCA/JCE`；`verifiedAt: 2026-08-13`。
   - `claims`：engine class 通过 provider 提供实现；algorithm-independent 与 algorithm-specific 初始化不同；
     provider 可选择默认参数，因此 algorithm/key/parameter/provider 必须一起形成合同。
   - `driftRisk: low`。
3. **`jdk25-standard-names`**
   - URL：<https://docs.oracle.com/en/java/javase/25/docs/specs/security/standard-names.html>。
   - `sourceType: specification`；`appliesTo: Java SE 25 security algorithms`；
     `verifiedAt: 2026-08-13`。
   - `claims`：定义 `Cipher` transformation、`Signature`、`Mac`、`SecureRandom`、`KDF`、`KeyStore`
     等标准名；标准名存在不代表每个 provider 支持同一可选参数。
   - `driftRisk: low`。
4. **`jdk25-providers`**
   - URL：<https://docs.oracle.com/en/java/javase/25/security/oracle-providers.html>。
   - `sourceType: official-reference`；`appliesTo: Oracle JDK 25 providers`；
     `verifiedAt: 2026-08-13`。
   - `claims`：列出 provider/algorithm/限制；SUN DRBG 支持机制、reseed 与 prediction resistance；不同 OS
     的默认 `SecureRandom` 顺序不同；PKCS12 的 password-less 行为不能当作 key 无保护。
   - `driftRisk: low`。
5. **`jdk25-secure-random`**
   - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/security/SecureRandom.html>。
   - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-13`。
   - `claims`：实例由 algorithm/provider/parameters 选择；`nextBytes` 是安全随机入口；强实例可能阻塞；
     `setSeed` 是补充 seed，不是用固定种子制造可复现安全随机数。
   - `driftRisk: low`。
6. **`jdk25-drbg-parameters`**
   - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/security/DrbgParameters.html>。
   - `sourceType: api-doc`；`appliesTo: Java 25 DRBG`；`verifiedAt: 2026-08-13`。
   - `claims`：请求 strength、capability、personalization、additional input 与 reseed；SUN 默认 DRBG 是
     Hash_DRBG/SHA-256、128-bit strength、无 prediction-resistance 请求，调用方必须核对 provider 合同。
   - `driftRisk: low`。
7. **`openjdk-jep510-kdf`**
   - URL：<https://openjdk.org/jeps/510>。
   - `sourceType: release-note`；`appliesTo: JDK 25 KDF API`；`verifiedAt: 2026-08-13`。
   - `claims`：JDK 25 正式交付 `javax.crypto.KDF` 和 HKDF；PBKDF2 不迁入该 API，继续由
     `SecretKeyFactory` 提供；HKDF 与密码 hashing 不是同一用途。
   - `driftRisk: low`。
8. **`jdk25-kdf`**
   - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/javax/crypto/KDF.html>。
   - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-13`。
   - `claims`：`getInstance` 按 algorithm、parameters、key material 选择 provider；`deriveKey` 与
     `deriveData` 输出合同不同；实例默认不保证线程安全。
   - `driftRisk: low`。
9. **`jdk25-pbe-key-spec`**
   - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/javax/crypto/spec/PBEKeySpec.html>。
   - `sourceType: api-doc`；`appliesTo: Java 25 PBE/PBKDF2 input`；`verifiedAt: 2026-08-13`。
   - `claims`：password 用 `char[]` 以便覆盖；salt、iteration、key length 是独立参数；调用方应清理
     `PBEKeySpec` 内副本和取出的副本。
   - `driftRisk: low`。
10. **`nist-sp800-132`**
    - URL：<https://csrc.nist.gov/pubs/sp/800/132/final>。
    - `sourceType: security-standard`；`appliesTo: password-based derivation for storage`；
      `verifiedAt: 2026-08-13`。
    - `claims`：从 password/passphrase 派生 master key 需要 salt 与 iteration count；该文档是存储应用
      范围，不支持把 password 直接截断/补零成 AES key。
    - `driftRisk: low`：2010 final，NIST 已声明计划修订，发布前需重查。
11. **`nist-800-63b-passwords`**
    - URL：<https://pages.nist.gov/800-63-4/sp800-63b/authenticators/>。
    - `sourceType: security-standard`；`appliesTo: human password verifiers`；
      `verifiedAt: 2026-08-13`。
    - `claims`：密码 verifier 要使用 salt 与 password hashing scheme，work factor 应在不损害服务性能的
      前提下尽量高并随算力增长；密码存储是单向验证，不是可逆 PBE。
    - `driftRisk: medium`：living NIST pages。
12. **`nist-sp800-90a-r1`**
    - URL：<https://csrc.nist.gov/pubs/sp/800/90/a/r1/final>。
    - `sourceType: security-standard`；`appliesTo: DRBG`；`verifiedAt: 2026-08-13`。
    - `claims`：定义 Hash_DRBG、HMAC_DRBG、CTR_DRBG；entropy source、instantiate、generate、reseed
      和 prediction resistance 是不同环节。
    - `driftRisk: low`：2015 final；Rev. 2 draft 不替代本卡。
13. **`jdk25-key`**
    - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/security/Key.html>。
    - `sourceType: api-doc`；`appliesTo: Java 25 key representation`；`verifiedAt: 2026-08-13`。
    - `claims`：key 有 algorithm、format 与 encoded form；public key 常用 X.509 SubjectPublicKeyInfo，
      private key 常用 PKCS#8；`getEncoded()` 可返回 null，编码是敏感 material 而非日志字段。
    - `driftRisk: low`。
14. **`jdk25-key-generation`**
    - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/security/KeyPairGenerator.html>。
    - `sourceType: api-doc`；`appliesTo: Java 25 asymmetric key generation`；
      `verifiedAt: 2026-08-13`。
    - `claims`：key pair generation 由 algorithm/provider、key size 或 algorithm parameters 与
      `SecureRandom` 初始化；不初始化会使用 provider-specific defaults。
    - `driftRisk: low`。
15. **`nist-sp800-57-part1-r5`**
    - URL：<https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final>。
    - `sourceType: security-standard`；`appliesTo: cryptographic key management`；
      `verifiedAt: 2026-08-13`。
    - `claims`：keying material 要有生成、分发、存储、使用、归档、撤销/销毁与 cryptoperiod 管理；
      轮换不是只替换配置值，验证端需管理旧/新 key 的重叠与退役。
    - `driftRisk: low`。

### AES-GCM、签名、MAC 与许可证 payload

16. **`jdk25-cipher`**
    - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/javax/crypto/Cipher.html>。
    - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-13`。
    - `claims`：AEAD tag 在加密时附加、解密时验证；AAD 必须在 ciphertext 前提供；同一 key 的 GCM IV
      必须唯一；tag 不匹配抛 `AEADBadTagException`，失败 plaintext 不得进入业务。
    - `driftRisk: low`。
17. **`jdk25-gcm-parameter-spec`**
    - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/javax/crypto/spec/GCMParameterSpec.html>。
    - `sourceType: api-doc`；`appliesTo: Java 25 AES-GCM parameters`；
      `verifiedAt: 2026-08-13`。
    - `claims`：`GCMParameterSpec` 只承载 IV 与 tag length；key、AAD、plaintext/ciphertext 和 tag 处理归
      `Cipher`；能构造任意 `tLen` 不代表 provider 或协议允许该值。
    - `driftRisk: low`。
18. **`nist-sp800-38d`**
    - URL：<https://csrc.nist.gov/pubs/sp/800/38/d/final>。
    - `sourceType: security-standard`；`appliesTo: GCM/GMAC`；`verifiedAt: 2026-08-13`。
    - `claims`：GCM 是 AEAD，GMAC 只认证不加密；96-bit IV 是主要推荐路径；同一 key 下 IV uniqueness、
      tag length 与 invocation limits 必须按协议设计，nonce 重用会破坏安全性。
    - `driftRisk: low`：2007 final，NIST 已声明计划修订，发布前需重查。
19. **`rfc5116-aead`**
    - URL：<https://www.rfc-editor.org/rfc/rfc5116.html>。
    - `sourceType: specification`；`appliesTo: AEAD interface and AES-GCM`；
      `verifiedAt: 2026-08-13`。
    - `claims`：AEAD 输入分为 key、nonce、plaintext 与 associated data；authenticated decryption 失败
      必须返回 FAIL；nonce 在指定 key 范围必须唯一，不能由调用者可重放字段直接复用。
    - `driftRisk: low`。
20. **`jdk25-signature`**
    - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/security/Signature.html>。
    - `sourceType: api-doc`；`appliesTo: Java 25 digital signatures`；
      `verifiedAt: 2026-08-13`。
    - `claims`：private key 用于签名，public key/certificate 用于验证；algorithm parameters 可能含 provider
      生成值，验证协议要固定算法、参数、key purpose 与输入 bytes。
    - `driftRisk: low`。
21. **`jdk25-mac`**
    - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/javax/crypto/Mac.html>。
    - `sourceType: api-doc`；`appliesTo: Java 25 MAC`；`verifiedAt: 2026-08-13`。
    - `claims`：MAC 使用共享 secret key 产生/验证 tag；知道验证 key 的各方也能伪造，不能提供公钥签名的
      第三方可验证性或签发者分离。
    - `driftRisk: low`。
22. **`rfc7515-jws`**
    - URL：<https://www.rfc-editor.org/rfc/rfc7515.html>。
    - `sourceType: specification`；`appliesTo: signed/MAC-protected payloads`；
      `verifiedAt: 2026-08-13`。
    - `claims`：JWS 明确定义 signature/MAC computation、validation、`alg`、`kid` 与 key identification；
      数字签名与 MAC 的信任模型不同；algorithm/key origin/protection 必须由 verifier policy 决定。
    - `driftRisk: low`。
23. **`rfc8785-json-canonicalization`**
    - URL：<https://www.rfc-editor.org/rfc/rfc8785.html>。
    - `sourceType: specification`；`appliesTo: deterministic JSON signing bytes`；
      `verifiedAt: 2026-08-13`。
    - `claims`：JCS 约束 I-JSON、primitive serialization 与 property sorting，产生 invariant UTF-8 bytes；
      “重新序列化普通对象”不能替代双方精确一致的 canonicalization contract。
    - `driftRisk: low`。
24. **`rfc5280-pkix`**
    - URL：<https://www.rfc-editor.org/rfc/rfc5280.html>。
    - `sourceType: specification`；`appliesTo: X.509 certificate paths and CRLs`；
      `verifiedAt: 2026-08-13`。
    - `claims`：证书路径验证、validity、name constraints、key usage 与 CRL/revocation 是不同检查；
      “签名数学成立”不自动证明 certificate/key 当前受信。
    - `driftRisk: low`。

### KeyStore、秘密配置、TLS 与 provider 扩展

25. **`jdk25-key-store`**
    - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/security/KeyStore.html>。
    - `sourceType: api-doc`；`appliesTo: Java 25`；`verifiedAt: 2026-08-13`。
    - `claims`：`PrivateKeyEntry`、`SecretKeyEntry`、`TrustedCertificateEntry` 语义不同；PKCS12 是必需标准
      type；store password 与 entry protection 可不同；keystore 文件不是 HSM，也不自动解决访问授权/轮换。
    - `driftRisk: low`。
26. **`openjdk-jep229-pkcs12-default`**
    - URL：<https://openjdk.org/jeps/229>。
    - `sourceType: release-note`；`appliesTo: JDK 9+ default KeyStore`；
      `verifiedAt: 2026-08-13`。
    - `claims`：JDK 9 将默认 keystore type 从 JKS 改为 PKCS12；已有 store 不会自动转换；跨版本协议应
      显式 type，不能依赖默认值。
    - `driftRisk: low`。
27. **`spring-boot-410-external-config`**
    - URL：<https://raw.githubusercontent.com/spring-projects/spring-boot/v4.1.0/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/features/external-config.adoc>。
    - `sourceType: official-reference`；`appliesTo: Spring Boot 4.1.0`；
      `verifiedAt: 2026-08-13`。
    - `claims`：property sources 有明确覆盖顺序；`configtree:` 将挂载文件映射为属性并可绑定 `String`/
      `byte[]`；环境变量对秘密有缺点；外部化与秘密存储/加密不是同义词。
    - `driftRisk: low`：固定 tag。
28. **`spring-boot-410-actuator-sanitization`**
    - URL：<https://raw.githubusercontent.com/spring-projects/spring-boot/v4.1.0/documentation/spring-boot-docs/src/docs/antora/modules/reference/pages/actuator/endpoints.adoc>。
    - `sourceType: official-reference`；`appliesTo: Spring Boot 4.1.0`；
      `verifiedAt: 2026-08-13`。
    - `claims`：`env`/`configprops` 默认完全 sanitization，但 endpoint exposure、`show-values`、授权与 custom
      sanitizer 会改变可见面；默认脱敏不能替代禁止日志、heap、异常、命令行和子进程泄漏。
    - `driftRisk: low`：固定 tag。
29. **`spring-boot-2312-external-config`**
    - URL：<https://docs.spring.io/spring-boot/docs/2.3.12.RELEASE/reference/html/spring-boot-features.html#boot-features-external-config>。
    - `sourceType: official-reference`；`appliesTo: Spring Boot 2.3.12.RELEASE`；
      `verifiedAt: 2026-08-13`。
    - `claims`：旧线支持 properties/YAML/environment/system/command-line 等覆盖与
      `@ConfigurationProperties`；不具备 Boot 2.4 Config Data `configtree:` 合同。
    - `driftRisk: low`：归档版本页。
30. **`jdk25-jsse-guide`**
    - URL：<https://docs.oracle.com/en/java/javase/25/security/java-secure-socket-extension-jsse-reference-guide.html>。
    - `sourceType: official-reference`；`appliesTo: Java 25 JSSE`；`verifiedAt: 2026-08-13`。
    - `claims`：默认 `SSLContext` 从 provider/default KeyManager/TrustManager 获得信任；TLS 需要协议、证书路径、
      endpoint identity 与 algorithm constraints；自定义 trust manager 不得变成空校验。
    - `driftRisk: low`。
31. **`jdk25-https-url-connection`**
    - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/javax/net/ssl/HttpsURLConnection.html>。
    - `sourceType: api-doc`；`appliesTo: Java 25 HTTPS`；`verifiedAt: 2026-08-13`。
    - `claims`：默认 hostname verifier 在默认规则失败时拒绝；全局或实例覆盖 verifier/factory 会改变
      身份验证面；`(host, session) -> true` 不是测试便利而是关闭身份校验。
    - `driftRisk: low`。
32. **`cwe-295-certificate-validation`**
    - URL：<https://cwe.mitre.org/data/definitions/295.html>。
    - `sourceType: security-standard`；`appliesTo: certificate validation failures`；
      `verifiedAt: 2026-08-13`。
    - `claims`：未验证或错误验证 certificate 会失去通信对端身份保证；trust-all 和 hostname-all 都属于
      现代实现必须拒绝的风险面。
    - `driftRisk: medium`：CWE 4.20 living page。
33. **`bc-provider-1.85.2`**
    - URL：<https://repo1.maven.org/maven2/org/bouncycastle/bcprov-jdk18on/1.85.2/bcprov-jdk18on-1.85.2.pom>。
    - `sourceType: official-reference`；`appliesTo: bcprov-jdk18on 1.85.2`；
      `verifiedAt: 2026-08-13`。
    - `claims`：精确 artifact/version 是 1.85.2，描述为 BC Java provider 与 low-level API，要求 Java 8+；
      可用于 Java 25/8 临时反馈环，但不证明冻结项目版本。
    - `driftRisk: low`：不可变 Maven 坐标。
34. **`bc-sm2-sm3-1.85.2`**
    - URL：<https://raw.githubusercontent.com/bcgit/bc-java/r1rv85v2/prov/src/main/java/org/bouncycastle/jcajce/provider/asymmetric/GM.java>、
      <https://raw.githubusercontent.com/bcgit/bc-java/r1rv85v2/prov/src/main/java/org/bouncycastle/jcajce/provider/digest/SM3.java>。
    - `sourceType: source-code`；`appliesTo: Bouncy Castle provider tag r1rv85v2`；
      `verifiedAt: 2026-08-13`。
    - `claims`：provider 注册 SM2 key agreement/key pair/cipher/signature 与 SM3 digest/HMAC 名称；调用方仍需
      固定 provider、算法、曲线/参数、encoding 与 protocol，不得把名称存在等同于互操作通过。
    - `driftRisk: low`：固定 tag。此来源卡包含两个直接 URL，frontmatter 应原样保留实际引用页。

### 产品版本、Legacy API 与补充协议来源

35. **`bc-java-1.85-release`**
    - URL：<https://www.bouncycastle.org/resources/new-release-bouncy-castle-java-1-85>。
    - `sourceType: release-note`；`appliesTo: Bouncy Castle Java product release 1.85`；
      `verifiedAt: 2026-08-13`。
    - `claims`：Bouncy Castle 官方将 Java 产品发布标为 1.85；该产品号与 Maven provider patch
      `bcprov-jdk18on:1.85.2` 必须分别记录。
    - `driftRisk: low`：固定发布页。
36. **`jdk8-jca-guide`**
    - URL：<https://docs.oracle.com/javase/8/docs/technotes/guides/security/crypto/CryptoSpec.html>。
    - `sourceType: official-reference`；`appliesTo: Java 8 JCA/JCE`；`verifiedAt: 2026-08-13`。
    - `claims`：Java 8 已有 provider/engine、`Cipher`、`Mac`、`Signature`、key generation/factory、
      password-based encryption 与 AEAD；旧线只能使用这些当时存在的 API 合同。
    - `driftRisk: low`：归档版本页。
37. **`jdk8-sun-providers`**
    - URL：<https://docs.oracle.com/javase/8/docs/technotes/guides/security/SunProviders.html>。
    - `sourceType: official-reference`；`appliesTo: Oracle/Sun JDK 8 providers`；
      `verifiedAt: 2026-08-13`。
    - `claims`：JDK 8 provider 的算法实现、别名、key size 与限制需按实际 runtime 核对；现代 JDK provider
      inventory 不能代替 Java 8 反馈环。
    - `driftRisk: low`：归档版本页。
38. **`jdk8-cipher`**
    - URL：<https://docs.oracle.com/javase/8/docs/api/javax/crypto/Cipher.html>。
    - `sourceType: api-doc`；`appliesTo: Java 8 Cipher/AEAD`；`verifiedAt: 2026-08-13`。
    - `claims`：Java 8 `Cipher` 已定义 AEAD、`updateAAD` 的调用顺序与 GCM 同 key IV uniqueness；
      transformation/provider availability 仍由运行时验证。
    - `driftRisk: low`：归档版本页。
39. **`jdk8-gcm-parameter-spec`**
    - URL：<https://docs.oracle.com/javase/8/docs/api/javax/crypto/spec/GCMParameterSpec.html>。
    - `sourceType: api-doc`；`appliesTo: Java 8 GCM parameters`；`verifiedAt: 2026-08-13`。
    - `claims`：Java 8 已有承载 tag length 与 IV 的 `GCMParameterSpec`；它不替调用方定义 nonce allocator、
      AAD encoding 或失败处理协议。
    - `driftRisk: low`：归档版本页。
40. **`jdk8-pbe-key-spec`**
    - URL：<https://docs.oracle.com/javase/8/docs/api/javax/crypto/spec/PBEKeySpec.html>。
    - `sourceType: api-doc`；`appliesTo: Java 8 password-based key input`；
      `verifiedAt: 2026-08-13`。
    - `claims`：Java 8 旧线已支持 password、salt、iteration count 与 key length 的 PBE 输入，并提供
      `clearPassword`；这不等于 Java 8 有 `javax.crypto.KDF`。
    - `driftRisk: low`：归档版本页。
41. **`jdk8-key-store`**
    - URL：<https://docs.oracle.com/javase/8/docs/api/java/security/KeyStore.html>。
    - `sourceType: api-doc`；`appliesTo: Java 8 KeyStore`；`verifiedAt: 2026-08-13`。
    - `claims`：Java 8 已定义 key/certificate entry 与显式 keystore type；跨版本代码须显式使用
      `PKCS12`，不能依赖 Java 8 的 JKS 默认值。
    - `driftRisk: low`：归档版本页。
42. **`jdk8-jsse-guide`**
    - URL：<https://docs.oracle.com/javase/8/docs/technotes/guides/security/jsse/JSSERefGuide.html>。
    - `sourceType: official-reference`；`appliesTo: Java 8 JSSE`；`verifiedAt: 2026-08-13`。
    - `claims`：Java 8 旧线已有 trust manager、key manager、HTTPS endpoint identification 与 hostname
      verification；旧版本不是 trust-all 的理由。
    - `driftRisk: low`：归档版本页。
43. **`jdk25-hkdf-parameter-spec`**
    - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/javax/crypto/spec/HKDFParameterSpec.html>。
    - `sourceType: api-doc`；`appliesTo: Java 25 HKDF parameters`；
      `verifiedAt: 2026-08-13`。
    - `claims`：Java 25 HKDF 参数显式区分 extract/expand、input key material、salt、info 与 output length；
      多段输入按协议顺序组合，不能把低熵 password 当作普通 IKM。
    - `driftRisk: low`。
44. **`rfc5869-hkdf`**
    - URL：<https://www.rfc-editor.org/rfc/rfc5869.txt>。
    - `sourceType: specification`；`appliesTo: HKDF extract-and-expand`；
      `verifiedAt: 2026-08-13`。
    - `claims`：HKDF 分 extract/expand 并用 salt/info 绑定上下文；RFC 明确它不是 password-based KDF，
      对低熵 password 不提供刻意减速。
    - `driftRisk: low`。
45. **`rfc8018-pkcs5`**
    - URL：<https://www.rfc-editor.org/rfc/rfc8018.txt>。
    - `sourceType: specification`；`appliesTo: PBKDF2 and password-based cryptography`；
      `verifiedAt: 2026-08-13`。
    - `claims`：PBKDF2 的 password、salt、iteration count、PRF 与 derived-key length 是协议参数；
      参数必须随 ciphertext/verifier 一起版本化，不能依赖 provider 默认值。
    - `driftRisk: low`。
46. **`jdk25-message-digest`**
    - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/security/MessageDigest.html>。
    - `sourceType: api-doc`；`appliesTo: Java 25 message digests`；
      `verifiedAt: 2026-08-13`。
    - `claims`：`MessageDigest` 只计算摘要并提供摘要比较入口；它没有 secret/private key，不能替代 MAC
      或 digital signature 的认证与签发者信任模型。
    - `driftRisk: low`。
47. **`spring-boot-24-config-data`**
    - URL：<https://spring.io/blog/2020/08/14/config-file-processing-in-spring-boot-2-4>。
    - `sourceType: release-note`；`appliesTo: Spring Boot 2.4 Config Data`；
      `verifiedAt: 2026-08-13`。
    - `claims`：`spring.config.import` 与 `configtree:` 属于 Boot 2.4 引入的 Config Data 机制；
      Boot 2.3.12 旧线不能原样复制该合同。
    - `driftRisk: low`：固定日期发布页。
48. **`jdk25-ssl-parameters`**
    - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/javax/net/ssl/SSLParameters.html>。
    - `sourceType: api-doc`；`appliesTo: Java 25 TLS endpoint identification`；
      `verifiedAt: 2026-08-13`。
    - `claims`：非空 endpoint identification algorithm 要求在握手期间验证 endpoint identity；
      raw `SSLSocket`/`SSLEngine` 不能仅凭证书链成功就假定 hostname 已验证。
    - `driftRisk: low`。
49. **`jdk25-cert-path-validator`**
    - URL：<https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/security/cert/CertPathValidator.html>。
    - `sourceType: api-doc`；`appliesTo: Java 25 PKIX path validation`；
      `verifiedAt: 2026-08-13`。
    - `claims`：certificate path validation 由算法、参数、trust anchors 与 checker/revocation 配置组成；
      path 验证与 endpoint identity 是两个检查层。
    - `driftRisk: low`。
50. **`rfc9525-tls-service-identity`**
    - URL：<https://www.rfc-editor.org/rfc/rfc9525.txt>。
    - `sourceType: specification`；`appliesTo: TLS service identity`；
      `verifiedAt: 2026-08-13`。
    - `claims`：客户端要把独立 reference identifier 与证书 SAN 标识匹配，并同时完成 PKIX path validation；
      不能以 Common Name 或 trust-all 代替服务身份校验。
    - `driftRisk: low`。
51. **`rfc8725-jwt-bcp`**
    - URL：<https://www.rfc-editor.org/rfc/rfc8725.html>。
    - `sourceType: security-standard`；`appliesTo: signed token verification patterns`；
      `verifiedAt: 2026-08-13`。
    - `claims`：verifier 应使用调用方支持的 algorithm allowlist、验证所有密码学操作、绑定 key 与算法并
      校验 issuer/audience 等上下文；许可证只借鉴此 fail-closed 模式，不声称 JWT 是许可证标准。
    - `driftRisk: low`。

### 风险分类来源

52. **`cwe-321-hard-coded-key`**
    - URL：<https://cwe.mitre.org/data/definitions/321.html>。
    - `sourceType: security-standard`；`appliesTo: hard-coded cryptographic keys`；
      `verifiedAt: 2026-08-13`。
    - `claims`：硬编码 key 会让所有部署共享可提取秘密，并阻碍泄漏后的独立轮换；只支持风险分类，
      不证明冻结项目路径实际存在漏洞。
    - `driftRisk: medium`：CWE living page。
53. **`cwe-330-insufficient-randomness`**
    - URL：<https://cwe.mitre.org/data/definitions/330.html>。
    - `sourceType: security-standard`；`appliesTo: insufficiently random values`；
      `verifiedAt: 2026-08-13`。
    - `claims`：安全相关值若可预测或熵不足会削弱 key、token 与 nonce；只支持风险分类，不从冻结路径
      推断具体随机源或可利用性。
    - `driftRisk: medium`：CWE living page。
54. **`cwe-347-signature-verification`**
    - URL：<https://cwe.mitre.org/data/definitions/347.html>。
    - `sourceType: security-standard`；`appliesTo: cryptographic signature verification`；
      `verifiedAt: 2026-08-13`。
    - `claims`：缺失或错误的签名验证会接受不可信数据；只支持 fail-closed 风险分类，不证明冻结项目的
      许可证实现可被绕过。
    - `driftRisk: medium`：CWE living page。
55. **`cwe-636-fail-open`**
    - URL：<https://cwe.mitre.org/data/definitions/636.html>。
    - `sourceType: security-standard`；`appliesTo: fail-open control flow`；
      `verifiedAt: 2026-08-13`。
    - `claims`：安全检查异常、缺失或不可用时继续受保护流程属于 fail-open 风险；只支持课程纠错边界，
      不证明冻结项目的具体运行结果。
    - `driftRisk: medium`：CWE living page。

## 本课结论与正文建议

### 1. JCA 调用必须冻结五元合同

1. 每次密码学操作至少冻结 engine、algorithm/transformation、key purpose/format、parameters 与 provider
   policy；其中任一项由不可信输入决定都会产生算法混淆、provider 漂移或参数降级。
2. `Cipher.getInstance("AES")` 省略 mode/padding，会把关键语义交给 provider 默认值；正文只使用完整
   transformation，并在启动验证 provider、key length、tag length、nonce policy 和可用算法。
3. generator 创建新 key material，factory 从现有 encoding/spec 重建 key；X.509 public、PKCS#8 private 与
   raw secret key 不能混用。encoded private/secret key 即秘密，不进入日志、异常、JSON 或普通配置模型。
4. SM2/SM3 是 provider 扩展能力，必须用固定 BC 1.85.2 artifact/tag 验证注册名与互操作向量；不能从项目
   符号名反推曲线、user ID、DER/plain signature encoding 或现有协议安全。

### 2. 随机、密码、KDF 和 PBE 分开设计

1. token、nonce、salt、key generation 使用 `SecureRandom`，不能使用 `Random`、`Math.random()`、时间戳、
   UUID 文本截断或固定 seed。默认 algorithm 会按 OS/provider 漂移；强度/阻塞要求必须按用途验证。
2. DRBG 的 security strength、prediction resistance、reseed 与 personalization 是不同选项。不要每次请求
   new 强实例或主动用低熵 `setSeed`；复用经过并发合同验证的安全实例或按 provider 指南管理。
3. 人类密码验证使用专用 salted password hashing scheme 与可升级 work factor；不可逆验证值不能解密。
   数据加密 PBE 使用独立 salt、KDF parameters 与 AEAD；不能直接把密码 bytes 当 AES key。
4. Java 25 HKDF 用于从高熵 IKM 派生有 domain-separated `salt/info` 的子密钥；它不是 password hashing。
   Java 8 无标准 KDF API，兼容实现必须锁定第三方 provider/API 并用 RFC/NIST 向量验证。

### 3. AES-GCM 是完整 AEAD 协议

1. 每把 key 下 nonce 唯一是不可妥协的协议状态。推荐 96-bit nonce；随机生成时必须按 key 统计碰撞预算和
   invocation limit，更稳妥时采用持久化 counter/prefix 分配，崩溃恢复不得回退。
2. 载荷 envelope 至少版本化记录 `version`、`keyId`、`nonce`、`ciphertext+tag` 与受认证元数据；algorithm
   不由 envelope 自由选择，而由本地 version/key registry allowlist 决定。
3. AAD 适合绑定 tenant、record ID、purpose、schema version 等不需保密但必须防篡改的上下文；加解密两端
   必须按同一编码与顺序提供，且在任何 ciphertext 前调用 `updateAAD`。
4. `AEADBadTagException`、未知 key、未知 version、nonce 格式错误或 provider 异常一律 fail-closed；不得返回
   部分 plaintext，不区分“密码错/内容改/上下文错”给外部攻击者。

### 4. 签名与 MAC 的信任模型不同

1. `Signature` 由 private key 签、public key 验，适合许可证发行方与 verifier 分离；`Mac` 双方共享 secret，
   每个 verifier 都具备伪造能力。离线许可证不能用嵌入客户端的 HMAC secret 模拟公钥签名。
2. 签名保护 bytes，不保护“对象含义”。双方先定义 canonical payload、字符编码、数值/时间格式、字段集合、
   unknown-field policy 与 maximum size；普通 JSON 重新序列化不是稳定签名协议。
3. `kid` 只在本地可信 key registry 精确查找；未知、重复、过长、path/URL-like 值拒绝。它不建立 key 信任，
   不允许动态下载任意 URL、读取文件或选择攻击者指定算法。
4. 签名验证使用 constant-time/provider API 结果；摘要相等不等于签名，Base64 decode 成功不等于验证成功。

### 5. KeyStore、秘密来源和轮换各有边界

1. PKCS12 可存 private key、secret key 与 trusted certificate，但 store password、entry password、文件权限、
   运行时读取权限与备份仍需单独治理；它不是 HSM/KMS，也不自动阻止进程内导出。
2. 生产 key 由受控 secret/KMS/HSM 或只读挂载提供；源码、默认配置、镜像层、命令行、测试 fixture、Git、
   异常和日志不得携带 secret。public verification key 可公开，但仍需防未授权替换与用途混用。
3. Spring Boot `configtree:` 解决文件到 property 的导入，不解决 secret at rest、RBAC、rotation 或 refresh。
   类型化配置只保存最小引用/临时值；禁止 `toString`、整体序列化和暴露 `env/configprops` 原值。
4. 轮换采用 stable key ID/version：先发布新验证 key，再切换签发/加密，旧 key 保留到最大有效期/迁移结束，
   最后退役并销毁。加密 key rotation 还需定义 re-encrypt/read-old-write-new 与失败恢复。

### 6. TLS 默认验证不得被便利代码覆盖

1. TLS 服务端身份由可信证书链与 endpoint/hostname verification 共同建立；加密握手成功但 hostname 未验，
   仍可能连接攻击者。private CA 应加入窄 truststore，而不是 trust-all。
2. `SSLContext.init(..., null, ...)` 使用 provider 默认 trust managers；自定义 `X509TrustManager` 若 accept-all，
   或 `HostnameVerifier` 恒 true，会移除身份保证。测试证书应在隔离 profile 与显式 truststore 中处理。
3. 全局 `setDefaultSSLSocketFactory`/`setDefaultHostnameVerifier` 扩大到同 JVM 后续连接；课程禁止全局关闭校验，
   客户端实例只接收最窄 trust/key material，并验证 negative hostname/untrusted/expired/revoked 场景。

### 7. 许可证验签是授权状态机，不只是 `Signature.verify`

1. 建议 envelope 为 `formatVersion`、`keyId`、`algorithmProfile`、canonical payload bytes、signature；payload
   至少有 `licenseId`、`product`、`features`、`subject/installation binding`、`issuedAt`、`notBefore`、
   `expiresAt`、`licenseVersion`。算法由本地 profile 固定，payload/header 只作匹配输入。
2. 验证顺序固定为：大小/结构 -> format/version allowlist -> `kid` registry -> canonical bytes -> 完整签名 ->
   issuer/product/subject binding -> time window -> feature constraints -> license/key revocation -> local rollback/
   replay policy。任何一步失败都不产生授权对象。
3. `expiresAt` 必须用受控 `Clock` 验证并定义小的 skew；缺失、无法解析、时钟异常、未来 `notBefore`、过期或
   本地 state rollback 都 fail-closed。验签成功不能绕过期限、product、machine/tenant 或 feature 限制。
4. 撤销需要受信 key/license denylist、signed status list 或等价受控状态，记录 freshness 与 last-known-good
   policy。高风险受保护能力在状态缺失/过期/校验异常时拒绝；不能把网络不可用自动解释成永久有效。
5. key rotation 时 verifier 可同时信任 active old/new public keys；unknown/retired/revoked `kid` 明确拒绝。
   私钥只在发行侧；应用包中只放按用途固定的 public verification keys/registry。

## `JAVA-RISK-015/016/019/020` 风险合同

| 风险类 | 触发条件 | 主要后果 | 正文最小控制与验证 |
| --- | --- | --- | --- |
| 敏感值生命周期过宽 | secret 进入 DTO、`String`、日志、异常、Actuator、缓存或序列化 | 长期泄漏、跨边界复制 | 最小类型/作用域；可清理 buffer；日志扫描；`env/configprops` 授权与脱敏 |
| 硬编码与不可轮换 | key/password/token 写在源码、默认配置、镜像或共享静态常量 | 泄漏后无法撤销，环境共用 | 外部受控来源；key ID/version；双 key 窗口；泄漏演练 |
| AEAD 协议缺口 | GCM nonce 重用、AAD 顺序/编码不同、tag 失败仍用 plaintext | 明文恢复、伪造、跨上下文替换 | per-key nonce allocator；versioned envelope；tag/AAD/nonce negative fixtures |
| 签名/许可证未闭环 | 只验签、不验 canonical payload/expiry/product/revocation，异常后继续 | 未授权功能、过期许可继续使用 | 固定状态机；任何失败无授权对象；固定时钟与撤销不可用测试 |
| 弱密码学兼容 | MD5/SHA-1/DES/3DES/RSA v1.5 被当现代方案 | 碰撞、穷举、oracle/迁移债务 | 仅标 legacy；现代 allowlist；已存数据迁移版本 |
| TLS trust-all | accept-all trust manager/hostname verifier 或全局默认覆盖 | MITM、凭据/数据泄漏 | 窄 truststore + hostname；三类 negative certificate fixture |
| 非安全随机 | `Random`/时间/固定 seed 生成 token、nonce、key | 可预测、碰撞、GCM 失效 | `SecureRandom`；DRBG/provider 记录；并发唯一性与重启恢复验证 |

## 冻结项目证据映射

以下只转录 Phase 2 冻结矩阵的 sourceId、计数、路径与稳定符号；未打开项目路径，也不从类名推断实现。
正文项目证据只能使用以下 `observed` 条目：

| sourceId | 冻结计数 | 冻结代表路径与稳定符号 | usage | 仅能支持的教学结论 |
| --- | ---: | --- | --- | --- |
| `JAVA-STDLIB-027` | 7 | `.../AESUtils.java`；`com.tdh.bdzz.util.AESUtils` | `observed` | 存在 JCA/JCE/Cipher 能力，不证明算法、mode、key 或参数安全 |
| `JAVA-STDLIB-027` | 7 | `.../JzRSAUtils.java`；`com.tdh.bdzz.util.JzRSAUtils` | `observed` | 存在非对称密码学候选，不证明 padding、encoding 或用途正确 |
| `JAVA-STDLIB-028` | 12 | `.../license/lic/License.java`；`tdh.platform.component.license.lic.License` | `observed` | 存在签名/许可证相关能力，不证明校验状态机闭环 |
| `JAVA-STDLIB-028` | 12 | `.../HMacUtils.java`；`com.tdh.bdzz.util.HMacUtils` | `observed` | 存在 MAC 能力，不证明 key 管理或 canonical payload 合同 |
| `JAVA-FRAMEWORK-034` | 9 | `.../SM2Util.java`；`com.tdh.bdzz.util.SM2Util` | `observed` | 存在 SM2/SM3/BC 候选，不证明 provider 版本或互操作参数 |
| `JAVA-ENGINEERING-026` | 15 | `.../DataSourceConfig.java`；`com.tdh.bdzz.config.DataSourceConfig` | `observed` | 存在敏感配置处理面，不证明秘密来源、脱敏或轮换完整 |
| `JAVA-ENGINEERING-026` | 15 | `.../license/lic/License.java`；`tdh.platform.component.license.lic.License` | `observed` | 存在许可证业务意图，不证明缺失/过期/撤销行为正确 |

以下只能保留在研究审计中，usage 固定为 `rejected`，不得进入正文项目证据卡：

| sourceId | 冻结计数 | 冻结代表路径与稳定符号 | usage | 只用于提示的风险 |
| --- | ---: | --- | --- | --- |
| `JAVA-RISK-015` | 174 | `.../LoginHandler.java`；`com.tdh.bdzz.handler.LoginHandler` | `rejected` | 凭据模型、回显与生命周期过宽 |
| `JAVA-RISK-016` | 11 | `.../EncryptConstant.java`；`com.tdh.bdzz.constant.EncryptConstant` | `rejected` | 硬编码秘密与不可轮换 key |
| `JAVA-RISK-019` | 5 | `.../license/lic/License.java`；`tdh.platform.component.license.lic.License` | `rejected` | 过期/签名失败状态转换未闭环 |
| `JAVA-RISK-019` | 5 | `.../license/lic/impl/LicFactoryImpl.java`；`tdh.platform.component.license.lic.impl.LicFactoryImpl` | `rejected` | 许可证缺失 fail-open |
| `JAVA-RISK-019` | 5 | `.../HeaderRequestInterceptor.java`；`com.tdh.bdzz.config.HeaderRequestInterceptor` | `rejected` | 签名失败后请求仍继续 |
| `JAVA-RISK-020` | 12 | `.../SSLClient.java`；`com.tdh.bdzz.util.SSLClient` | `rejected` | TLS trust/hostname 绕过 |
| `JAVA-RISK-020` | 12 | `.../DesFilter.java`；`com.tdh.bdzz.filter.DesFilter` | `rejected` | 3DES 等 legacy crypto 被误作推荐 |
| `JAVA-RISK-020` | 12 | `.../CodeGenerator.java`；`com.tdh.bdzz.util.CodeGenerator` | `rejected` | 非安全随机数用于安全标识 |

路径均来自冻结矩阵并以 `.../` 缩写展示；计数和代表符号之间可能重叠，不能求和为独立事实。

## 不能推出与不得声称

- 不能由 `Cipher.getInstance` 成功推出 transformation/参数安全、provider 稳定或互操作通过。
- 不能由 AES key 长度正确推出加密安全；mode、nonce uniqueness、tag、AAD、key lifecycle 同样是合同。
- 不能由 GCM 解密产生 bytes 推出可信；只有 `doFinal` 完整 tag 验证成功后才可发布 plaintext。
- 不能把 salt 当 secret，也不能把 nonce 当 key；salt 可存储但需随机/唯一，nonce 可公开但每 key 不可重用。
- 不能把 HKDF 用于人类密码存储，也不能把 password hash 当加密 key 或可逆 ciphertext。
- 不能由 `Signature.verify=true` 推出许可证有效；还需 canonical payload、可信 key、profile/version、
  product/subject、时间、features、revocation 与本地状态检查。
- 不能由 MAC 有效推出只有发行方能签发；所有共享 MAC key 的 verifier 都能伪造。
- 不能由 `kid` 命中、certificate parse 成功或 public key 可用推出 key 可信、未撤销或用途正确。
- 不能由 PKCS12 文件有密码推出 secret 受 HSM 等级保护；也不能由 public key 非秘密推出可被任意替换。
- 不能由 `configtree:`、环境变量或外部配置推出 secret 已加密、权限正确、支持热轮换或不会被 Actuator/log 泄漏。
- 不能由 TLS 流量加密推出 endpoint identity 已验证；trust-all 或 hostname-all 会移除服务端身份保证。
- 不能把 Java 25 `KDF`、DRBG API、Boot 4.1 `configtree:` 或 PKCS12 默认值写成 Java 8 合同。
- 不能把 BC 1.85.2 临时验证结果或 artifact 的 Java 8+ 声明写成冻结项目依赖版本。
- 不能由 observed 类名推断具体漏洞；四个 risk source 的代表路径只能 `rejected/corrected`，不得推荐复制。

## 易错点取证合同

正文至少覆盖以下 14 个可观察错误，每项按“现象 -> 触发条件 -> 原因 -> 后果 -> 错误示例 ->
正确写法 -> 影响版本 -> 验证方式 -> 来源”组织：

1. 使用 `Cipher.getInstance("AES")` 或由输入拼 transformation，依赖 provider 默认 mode/padding。
2. 用 `Random`、`Math.random()`、时间或固定 seed 生成 key、nonce、token、salt。
3. 把 DRBG、`getInstanceStrong()`、prediction resistance 和“永不阻塞”混成一个默认保证。
4. 直接截断/补零 password 作为 AES key，或用普通快速 hash 存储人类密码。
5. 把 Java 25 HKDF 当 password hashing，或在 Java 8 示例中引用不存在的 `javax.crypto.KDF`。
6. AES-GCM 在同一 key 下重用 nonce，或无持久化计数器导致重启回退。
7. AAD 在 ciphertext 后提供、编码/字段顺序不一致，或 tag 失败仍使用 plaintext。
8. 把 `MessageDigest` 当 MAC/签名，或用 HMAC 为离线客户端许可证提供“发行方唯一签发”保证。
9. 对普通 JSON 对象再次序列化后验签，没有冻结 canonical bytes、字段/数值/时间规则。
10. 信任 payload 的 `alg/kid/version` 动态选任意算法、URL、文件或 provider。
11. 私钥/secret key 的 encoded bytes、password、token 进入源码、`String`、日志、异常、Actuator 或 DTO。
12. 依赖默认 KeyStore type 跨 Java 8/25，或把 PKCS12 当 HSM/KMS/自动轮换。
13. 使用 accept-all trust manager/hostname verifier，尤其修改 JVM 全局 HTTPS defaults。
14. 许可证只验签，漏验 expiry/product/subject/features/revocation；missing、异常或状态不可用时 fail-open。

## Java 25 / Java 8 临时验证设计

所有资产放入 `/tmp` 的 `mktemp` 目录；成功后使用精确 `find <dir> -depth -delete` 清理并以 `test ! -e`
确认不存在。不得向仓库加入测试、key、keystore、license、secret、token 或构建产物。

1. **JCA/provider inventory fixture**：在 OpenJDK 25.0.4 与 Zulu 8u502-b07 输出最小 runtime、provider、
   `SecureRandom`、AES-GCM、PBKDF2、PKCS12 能力；Java 25 额外验证 DRBG/KDF，断言 Java 8 隔离代码不引用它们。
2. **random fixture**：生成安全 token/salt/96-bit nonce，验证长度、跨批次无重复和并发使用；DRBG 记录实际
   parameters/capability。测试不以统计分布“证明密码学安全”，只证明 API、唯一性 allocator 与失败合同。
3. **KDF/PBE fixture**：固定向量验证 Java 25 HKDF；PBKDF2 在两 runtime 验证同 password+salt+iterations
   一致、不同 salt 不同、wrong password 不通过；`PBEKeySpec` 与临时副本清理。
4. **AES-GCM fixture**：固定 key/nonce/AAD fixture 覆盖 round-trip、wrong key、nonce、AAD、tag 和 truncated
   ciphertext；失败统一为 `DECRYPT_REJECTED` 且没有 plaintext。另验证 envelope version/key ID allowlist。
5. **Signature/MAC fixture**：临时生成 signing key pair 与 HMAC key；证明 public key 只能 verify，MAC verifier
   持有共享 secret 可自行 forge；tampered payload/signature 均拒绝。
6. **canonical license fixture**：以 RFC 8785 canonical bytes 签名，打乱 JSON property 输入仍得到同 bytes；
   number/string/time/unknown-field 变化按 profile 拒绝，不能靠普通 serializer 偶然顺序通过。
7. **license state fixture**：固定 `Clock` 覆盖 valid、future `notBefore`、expired、wrong product/subject、unknown
   version/kid、revoked license/key、revocation store unavailable 与 clock rollback；任一失败不创建授权对象。
8. **rotation fixture**：old/new verification keys 同时发布，切换签发 key 后旧许可证仍在有效窗通过；退役/revoke
   后精确失败。加密 key 演示 read-old-write-new，不在旧 key 删除前留下不可恢复 ciphertext。
9. **PKCS12 fixture**：显式 `KeyStore.getInstance("PKCS12")` 保存/加载 private/secret/certificate entries，验证
   wrong store/entry password 和文件权限；对比两 runtime 的 default type 但业务不依赖它。
10. **BC fixture**：固定 `bcprov-jdk18on:1.85.2`，在 Java 25/8 核对 provider/version 与 SM2/SM3 注册，使用
    官方/标准向量验证摘要、签名 encoding 与 wrong-key/tamper；不宣称复原冻结项目协议。
11. **TLS fixture**：本地临时 CA 生成 trusted-correct-host、trusted-wrong-host、untrusted、expired 证书；默认/
    窄 truststore 只允许第一种，禁止任何 accept-all 和 JVM 全局 defaults 修改。
12. **Boot secret fixture**：Boot 4.1.0 从临时只读 `configtree:` 绑定 secret reference/value，验证 source precedence、
    validation 与 Actuator/log sanitization；Boot 2.3.12 只验证其归档 external config 路径，不复制 `configtree:`。
13. 两套核心 fixture 各连续运行两次，记录依赖/runtime/provider 与稳定摘要；第二次不得依赖第一次的 nonce
    counter、keystore、static cache、license status 或临时文件。所有输出扫描 secret/private key/password。

研究阶段只设计反馈环，不创建或运行临时应用、测试、证书、key、license、浏览器或 `dzzz-app`。

## 课程结构与发布 Gate

### 正文建议顺序

1. 从 JCA engine/provider 与五元合同入手，区分 algorithm、key、parameters、provider 和 protocol。
2. 依次区分 `SecureRandom`/DRBG、密码 hashing、PBKDF2/PBE 与 Java 25 HKDF。
3. 用 versioned envelope 完整展示 AES-GCM nonce、tag、AAD 与失败不发布 plaintext。
4. 对比 digest、MAC、digital signature 的能力与信任模型，再引入 canonical payload 与 `kid` registry。
5. 讲 key generation/encoding、PKCS12、受控 secret source、Boot `configtree:` 和轮换状态机。
6. 以默认 JSSE 信任链 + hostname 验证收束 TLS，拒绝 trust-all/global override。
7. 最后把前述能力组合为许可证完整验证状态机，覆盖 expiry/revocation/fail-closed 与 Java 8 隔离线。

### 发布前必须通过

- [x] ID、标题、顺序 620、两个前置、8 个来源能力、处置、版本合同与 planned/not-started 状态已核对。
- [x] 56 个唯一官方 URL 均记录稳定 ID、URL、版本/适用范围、日期、可支持声明与漂移风险。
- [x] 覆盖 JCA/provider/algorithm/key/parameter、random/DRBG、password/KDF/PBE、AES-GCM、签名/MAC、
  key lifecycle/PKCS12、Boot secrets、TLS 和完整许可证状态机。
- [x] Java 25/OpenJDK 25.0.4 与 Java 8/Zulu 8u502-b07、Boot 4.1/2.3、BC 1.85/1.85.2 已消歧。
- [x] 正文 evidence 只允许 observed；四个 risk 的代表路径均保留为 rejected/corrected。
- [x] 14 个易错点与双 runtime、provider、AEAD、license、TLS、secret 的临时反馈环已冻结。
- [ ] 课程正文按本稿合同创建，frontmatter 只保留实际支持正文声明的直接 URL。
- [ ] Java 25/8 临时反馈环连续两次通过，临时资产清理且输出没有 secret/key/license 泄漏。
- [ ] 内容合同、Catalog 冷启动、Phase 2 validator、根质量 Gate、build、浏览器与独立复审通过。
- [ ] signoff 写入最终 SHA；完成前不得开始第 14 课。

## 研究 Gate 自检

- [x] 本文件是本任务唯一写入；未修改正文、track、loader、manifest、signoff、依赖或测试。
- [x] Tavily 首选及官方直接核验已记录；没有将搜索摘要作为最终证据。
- [x] 未读取、搜索、运行或修改外部 `dzzz-app`；项目事实只来自仓库 Phase 2 冻结清单。
- [x] 4 项 observed capability 与 4 项 rejected risk 严格分离，没有从路径/类名断言实际漏洞。
- [x] Java 25/8、Boot 4.1/2.3、BC product/artifact/provider 合同已隔离。
- [x] source URL 集合适合正文 frontmatter 原样选用；研究结论没有虚构通用许可证标准。
- [x] 行数、格式、唯一 URL、URL 可达性、scoped diff 与 SHA-256 由写入后的外部命令核验。

## 发布结论与 Stop Boundary

本文件只完成 Java 高级第 13 门课程的官方资料研究。研究稿通过格式、URL、冻结映射、行数、SHA 与唯一文件
差异核验后，主流程才可进入本课正文 Gate；本任务不授权正文、track/loader/manifest、测试、浏览器、signoff、
下一课、commit、stage 或 push。
