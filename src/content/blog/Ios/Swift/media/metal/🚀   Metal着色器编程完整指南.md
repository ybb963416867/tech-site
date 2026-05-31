---
title: "Metal着色器编程完整指南"
description: "1. [Metal着色器基础](metal着色器基础) 2. [基本头文件和命名空间](基本头文件和命名空间) 3. [数据类型和结构体](数据类型和结构体) 4. [顶点着色器详解](顶点着色器详解) 5. [片段着色器详解](片段..."
pubDate: 2026-05-29
category: "metal"
tags: [API]
draft: false
---
# 🚀   Metal着色器编程完整指南

## 目录

1.  [Metal着色器基础](#metal着色器基础)
2.  [基本头文件和命名空间](#基本头文件和命名空间)
3.  [数据类型和结构体](#数据类型和结构体)
4.  [顶点着色器详解](#顶点着色器详解)
5.  [片段着色器详解](#片段着色器详解)
6.  [计算着色器](#计算着色器)
7.  [Metal特殊语法和修饰符](#metal特殊语法和修饰符)
8.  [常用内建函数](#常用内建函数)
9.  [最佳实践](#最佳实践)
10. [完整示例代码](#完整示例代码)

***

## Metal着色器基础

Metal是苹果开发的低级3D图形和计算API，Metal着色器使用Metal Shading Language (MSL)编写。MSL基于C++11，但针对GPU编程进行了专门优化。

### Metal着色器的主要类型：

*   **顶点着色器（Vertex Shader）**：处理每个顶点的变换
*   **片段着色器（Fragment Shader）**：处理每个像素的颜色计算
*   **计算着色器（Compute Shader）**：执行通用并行计算

***

## 基本头文件和命名空间

```metal
#include <metal_stdlib>
using namespace metal;
```

### 详细说明：

*   `#include <metal_stdlib>`：包含Metal标准库，提供所有内建函数和类型
*   `using namespace metal;`：避免每次使用Metal类型时都要加`metal::`前缀

***

## 数据类型和结构体

### 基础数据类型

| 类型              | 描述              | 示例                                                                     |
| --------------- | --------------- | ---------------------------------------------------------------------- |
| `float`         | 32位浮点数          | `float value = 1.0f;`                                                  |
| `float2`        | 2D向量            | `float2 uv = float2(0.5, 0.5);`                                        |
| `float3`        | 3D向量 16 字节，其他填充 | `float3 position = float3(1.0, 2.0, 3.0);`                             |
| `float4`        | 4D向量            | `float4 color = float4(1.0, 0.0, 0.0, 1.0);`                           |
| `float4x4`      | 4x4矩阵           | `float4x4 transform;`                                                  |
| `int`, `uint`   | 整数类型            | `int count = 10;`                                                      |
| `bool`          | 布尔类型            | `bool isVisible = true;`                                               |
| `packed_float3` | 32位浮点数，12字节 对齐  | `packed_float3 a = packed_float3(1.0, 2.0, 0); float3 b = float3(a); ` |

### 结构体定义

```metal
// 顶点输入数据结构
struct VertexIn {
    float3 position [[attribute(0)]];  // 顶点位置
    float2 texCoord [[attribute(1)]];  // 纹理坐标
    float3 normal   [[attribute(2)]];  // 法向量
    float4 color    [[attribute(3)]];  // 顶点颜色
};

// 顶点着色器输出 / 片段着色器输入
struct VertexOut {
    float4 position [[position]];      // 必需：裁剪空间位置
    float2 texCoord;                   // 纹理坐标
    float3 worldNormal;                // 世界空间法向量
    float3 worldPosition;              // 世界空间位置
    float4 color;                      // 顶点颜色
};

// Uniform常量缓冲区
struct Uniforms {
    float4x4 modelViewProjectionMatrix;  // MVP矩阵
    float4x4 modelMatrix;                // 模型矩阵
    float4x4 viewMatrix;                 // 视图矩阵
    float4x4 projectionMatrix;           // 投影矩阵
    float4x4 normalMatrix;               // 法向量变换矩阵
    
    // 光照参数
    float3 lightPosition;
    float3 lightColor;
    float3 cameraPosition;
    
    // 材质参数
    float3 ambientColor;
    float3 diffuseColor;
    float3 specularColor;
    float shininess;
    
    // 时间和其他参数
    float time;
    float deltaTime;
};
```

***

## 顶点着色器详解

### 基本顶点着色器

```metal
vertex VertexOut vertex_main(
    VertexIn in [[stage_in]],                    // 顶点输入
    constant Uniforms& uniforms [[buffer(0)]],  // Uniform缓冲区
    uint vertexID [[vertex_id]]                  // 顶点ID（可选）
) {
    VertexOut out;
    
    // 1. 计算世界空间位置
    float4 worldPosition = uniforms.modelMatrix * float4(in.position, 1.0);
    out.worldPosition = worldPosition.xyz;
    
    // 2. 计算裁剪空间位置（必需）
    out.position = uniforms.modelViewProjectionMatrix * float4(in.position, 1.0);
    
    // 3. 变换法向量到世界空间
    out.worldNormal = normalize((uniforms.normalMatrix * float4(in.normal, 0.0)).xyz);
    
    // 4. 传递其他数据
    out.texCoord = in.texCoord;
    out.color = in.color;
    
    return out;
}
```

### 顶点着色器功能详解：

1.  **坐标变换**：
    *   将模型空间坐标变换到世界空间
    *   最终变换到裁剪空间（NDC坐标）

2.  **法向量处理**：
    *   使用法向量矩阵变换法向量
    *   确保法向量在非均匀缩放后保持正确

3.  **数据传递**：
    *   将需要在片段着色器中使用的数据传递下去
    *   GPU会自动进行插值处理

### 特殊用途的顶点着色器示例

```metal
// 2D UI渲染的简化顶点着色器
vertex VertexOut vertex_2d_ui(
    VertexIn in [[stage_in]],
    constant float4x4& orthoMatrix [[buffer(0)]]
) {
    VertexOut out;
    out.position = orthoMatrix * float4(in.position.xy, 0.0, 1.0);
    out.texCoord = in.texCoord;
    out.color = in.color;
    return out;
}

// 天空盒顶点着色器
vertex VertexOut vertex_skybox(
    VertexIn in [[stage_in]],
    constant Uniforms& uniforms [[buffer(0)]]
) {
    VertexOut out;
    // 移除平移变换，只保留旋转
    float4x4 viewWithoutTranslation = uniforms.viewMatrix;
    viewWithoutTranslation[3][0] = 0.0;
    viewWithoutTranslation[3][1] = 0.0;
    viewWithoutTranslation[3][2] = 0.0;
    
    out.position = uniforms.projectionMatrix * viewWithoutTranslation * float4(in.position, 1.0);
    out.texCoord = in.position.xy; // 使用位置作为纹理坐标
    return out;
}
```

***

## 片段着色器详解

### 基本片段着色器

```metal
fragment float4 fragment_main(
    VertexOut in [[stage_in]],                           // 插值后的顶点数据
    constant Uniforms& uniforms [[buffer(0)]],          // Uniform缓冲区
    texture2d<float> baseTexture [[texture(0)]],        // 基础纹理
    texture2d<float> normalMap [[texture(1)]],          // 法线贴图
    sampler textureSampler [[sampler(0)]]               // 纹理采样器
) {
    // 1. 纹理采样
    float4 baseColor = baseTexture.sample(textureSampler, in.texCoord);
    float3 normalMapSample = normalMap.sample(textureSampler, in.texCoord).rgb;
    
    // 2. 法线贴图处理
    float3 normal = normalize(normalMapSample * 2.0 - 1.0); // 从[0,1]映射到[-1,1]
    
    // 3. 光照计算
    return calculateLighting(in, uniforms, baseColor, normal);
}

// 光照计算函数
float4 calculateLighting(
    VertexOut in,
    constant Uniforms& uniforms,
    float4 baseColor,
    float3 normal
) {
    float3 lightDir = normalize(uniforms.lightPosition - in.worldPosition);
    float3 viewDir = normalize(uniforms.cameraPosition - in.worldPosition);
    float3 reflectDir = reflect(-lightDir, normal);
    
    // 环境光
    float3 ambient = uniforms.ambientColor * baseColor.rgb;
    
    // 漫反射
    float diff = max(dot(normal, lightDir), 0.0);
    float3 diffuse = diff * uniforms.lightColor * uniforms.diffuseColor * baseColor.rgb;
    
    // 镜面反射
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), uniforms.shininess);
    float3 specular = spec * uniforms.lightColor * uniforms.specularColor;
    
    float3 finalColor = ambient + diffuse + specular;
    return float4(finalColor, baseColor.a);
}
```

### 常见片段着色器效果

```metal
// 纯纹理渲染
fragment float4 fragment_texture_only(
    VertexOut in [[stage_in]],
    texture2d<float> tex [[texture(0)]],
    sampler samp [[sampler(0)]]
) {
    return tex.sample(samp, in.texCoord);
}

// 纯色渲染
fragment float4 fragment_solid_color(
    VertexOut in [[stage_in]],
    constant float4& color [[buffer(0)]]
) {
    return color;
}

// 渐变效果
fragment float4 fragment_gradient(
    VertexOut in [[stage_in]]
) {
    float gradient = smoothstep(0.0, 1.0, in.texCoord.y);
    return mix(float4(1.0, 0.0, 0.0, 1.0), float4(0.0, 0.0, 1.0, 1.0), gradient);
}

// 程序化噪声纹理
fragment float4 fragment_noise(
    VertexOut in [[stage_in]],
    constant Uniforms& uniforms [[buffer(0)]]
) {
    float2 uv = in.texCoord * 10.0;
    float noise = fract(sin(dot(uv, float2(12.9898, 78.233))) * 43758.5453);
    return float4(noise, noise, noise, 1.0);
}
```

***

## 计算着色器

计算着色器用于通用并行计算，不直接参与图形渲染管道。

```metal
// 基本计算着色器
kernel void compute_basic(
    device float* inputData [[buffer(0)]],      // 输入数据
    device float* outputData [[buffer(1)]],     // 输出数据
    constant uint& dataSize [[buffer(2)]],      // 数据大小
    uint index [[thread_position_in_grid]]      // 当前线程索引
) {
    if (index >= dataSize) return;
    
    // 简单数学运算
    outputData[index] = sin(inputData[index]) * cos(inputData[index]);
}

// 图像处理计算着色器
kernel void compute_image_filter(
    texture2d<float, access::read> inputTexture [[texture(0)]],
    texture2d<float, access::write> outputTexture [[texture(1)]],
    uint2 gid [[thread_position_in_grid]]
) {
    if (gid.x >= inputTexture.get_width() || gid.y >= inputTexture.get_height()) {
        return;
    }
    
    // 简单模糊滤镜
    float4 color = float4(0.0);
    for (int dx = -1; dx <= 1; dx++) {
        for (int dy = -1; dy <= 1; dy++) {
            uint2 coord = uint2(int2(gid) + int2(dx, dy));
            color += inputTexture.read(coord);
        }
    }
    color /= 9.0; // 平均值
    
    outputTexture.write(color, gid);
}

// 粒子系统更新
kernel void compute_particles(
    device Particle* particles [[buffer(0)]],
    constant ParticleUniforms& uniforms [[buffer(1)]],
    uint index [[thread_position_in_grid]]
) {
    if (index >= uniforms.particleCount) return;
    
    Particle& particle = particles[index];
    
    // 更新位置
    particle.position += particle.velocity * uniforms.deltaTime;
    
    // 应用重力
    particle.velocity += uniforms.gravity * uniforms.deltaTime;
    
    // 生命周期管理
    particle.life -= uniforms.deltaTime;
    if (particle.life <= 0.0) {
        // 重置粒子
        particle = generateNewParticle(index, uniforms);
    }
}
```

***

## Metal特殊语法和修饰符

### 函数类型修饰符

| 修饰符        | 用途      | 示例                                   |
| ---------- | ------- | ------------------------------------ |
| `vertex`   | 顶点着色器函数 | `vertex VertexOut vertex_main(...)`  |
| `fragment` | 片段着色器函数 | `fragment float4 fragment_main(...)` |
| `kernel`   | 计算着色器函数 | `kernel void compute_main(...)`      |

### 参数修饰符

| 修饰符                | 描述    | 用途            |
| ------------------ | ----- | ------------- |
| `[[stage_in]]`     | 阶段输入  | 顶点或片段着色器的主要输入 |
| `[[buffer(n)]]`    | 缓冲区绑定 | 绑定到指定索引的缓冲区   |
| `[[texture(n)]]`   | 纹理绑定  | 绑定到指定索引的纹理    |
| `[[sampler(n)]]`   | 采样器绑定 | 绑定到指定索引的采样器   |
| `[[attribute(n)]]` | 顶点属性  | 指定顶点属性索引      |
| `[[position]]`     | 位置输出  | 顶点着色器的位置输出    |
| `[[vertex_id]]`    | 顶点ID  | 当前顶点的唯一标识符    |
| `[[instance_id]]`  | 实例ID  | 实例渲染中的实例标识符   |

### 内存修饰符

| 修饰符                                    | 描述      | 访问权限 |
| -------------------------------------- | ------- | ---- |
| `device`                               | 设备内存    | 读写   |
| `constant`                             | 常量内存    | 只读   |
| `threadgroup`                          | 线程组共享内存 | 读写   |
| `texture2d<float, access::read>`       | 只读纹理    | 只读   |
| `texture2d<float, access::write>`      | 只写纹理    | 只写   |
| `texture2d<float, access::read_write>` | 读写纹理    | 读写   |

***

## 常用内建函数

### 数学函数

```metal
// 基本数学运算
float result1 = sin(angle);
float result2 = cos(angle);
float result3 = tan(angle);
float result4 = sqrt(value);
float result5 = pow(base, exponent);
float result6 = exp(value);
float result7 = log(value);

// 向量运算
float dotProduct = dot(vec1, vec2);
float3 crossProduct = cross(vec1, vec2);
float vectorLength = length(vector);
float3 normalizedVector = normalize(vector);
float distance = distance(point1, point2);

// 插值和混合
float lerpResult = mix(value1, value2, factor);
float smoothResult = smoothstep(edge0, edge1, x);
float stepResult = step(edge, x);

// 限制函数
float clampedValue = clamp(value, minVal, maxVal);
float minValue = min(val1, val2);
float maxValue = max(val1, val2);
```

### 纹理采样函数

```metal
// 基本采样
float4 color = texture.sample(sampler, uv);

// 带偏移的采样
float4 colorWithBias = texture.sample(sampler, uv, bias(biasValue));

// 带梯度的采样
float4 colorWithGrad = texture.sample(sampler, uv, gradient2d(dPdx, dPdy));

// 读取特定mipmap级别
float4 colorLod = texture.sample(sampler, uv, level(lodLevel));

// 直接读取纹理像素（无过滤）
float4 pixelColor = texture.read(uint2(x, y));
```

***

## 最佳实践

### 1. 性能优化

```metal
// 避免在片段着色器中进行复杂计算
// 好：在顶点着色器中计算，插值传递
vertex VertexOut vertex_optimized(VertexIn in [[stage_in]]) {
    VertexOut out;
    out.lightDirection = normalize(lightPos - in.position); // 在这里计算
    return out;
}

fragment float4 fragment_optimized(VertexOut in [[stage_in]]) {
    float NdotL = max(dot(in.normal, in.lightDirection), 0.0); // 直接使用
    return float4(NdotL, NdotL, NdotL, 1.0);
}

// 使用精确的数据类型
half3 lowPrecisionColor;  // 16位精度，移动设备更高效
float3 highPrecisionPos;  // 32位精度，用于位置计算
```

### 2. 代码结构

```metal
// 将复杂逻辑封装在函数中
float3 calculatePhongLighting(
    float3 normal,
    float3 lightDir,
    float3 viewDir,
    float3 lightColor,
    float shininess
) {
    float3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    float diff = max(dot(normal, lightDir), 0.0);
    return lightColor * (diff + spec);
}

// 使用常量定义魔术数字
constant float PI = 3.14159265359;
constant float TWO_PI = 6.28318530718;
constant float EPSILON = 1e-6;
```

### 3. 调试技巧

```metal
// 使用颜色输出调试数据
fragment float4 debug_normals(VertexOut in [[stage_in]]) {
    // 将法向量可视化为颜色
    float3 color = in.worldNormal * 0.5 + 0.5; // 从[-1,1]映射到[0,1]
    return float4(color, 1.0);
}

fragment float4 debug_uvs(VertexOut in [[stage_in]]) {
    // 可视化UV坐标
    return float4(in.texCoord, 0.0, 1.0);
}
```

***

## 完整示例代码

以下是一个完整的Metal着色器文件示例，包含多种效果：

```metal
#include <metal_stdlib>
using namespace metal;

// ========== 数据结构定义 ==========

struct VertexIn {
    float3 position [[attribute(0)]];
    float2 texCoord [[attribute(1)]];
    float3 normal   [[attribute(2)]];
    float4 color    [[attribute(3)]];
    float3 tangent  [[attribute(4)]];
};

struct VertexOut {
    float4 position [[position]];
    float2 texCoord;
    float3 worldNormal;
    float3 worldPosition;
    float4 color;
    float3 worldTangent;
    float3 worldBitangent;
};

struct Uniforms {
    float4x4 modelViewProjectionMatrix;
    float4x4 modelMatrix;
    float4x4 normalMatrix;
    
    float3 lightPosition;
    float3 lightColor;
    float3 cameraPosition;
    
    float3 ambientColor;
    float shininess;
    float time;
    
    // PBR材质参数
    float metallic;
    float roughness;
    float3 albedo;
};

// ========== 工具函数 ==========

float3 calculateTangentBitangent(float3 normal, float3 tangent) {
    float3 bitangent = cross(normal, tangent);
    return bitangent;
}

float distributionGGX(float3 N, float3 H, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;
    
    float num = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = 3.14159265359 * denom * denom;
    
    return num / denom;
}

// ========== 顶点着色器 ==========

vertex VertexOut vertex_pbr(
    VertexIn in [[stage_in]],
    constant Uniforms& uniforms [[buffer(0)]]
) {
    VertexOut out;
    
    // 计算世界空间位置
    float4 worldPosition = uniforms.modelMatrix * float4(in.position, 1.0);
    out.worldPosition = worldPosition.xyz;
    
    // 计算裁剪空间位置
    out.position = uniforms.modelViewProjectionMatrix * float4(in.position, 1.0);
    
    // 变换法向量和切线到世界空间
    out.worldNormal = normalize((uniforms.normalMatrix * float4(in.normal, 0.0)).xyz);
    out.worldTangent = normalize((uniforms.modelMatrix * float4(in.tangent, 0.0)).xyz);
    out.worldBitangent = calculateTangentBitangent(out.worldNormal, out.worldTangent);
    
    // 传递其他数据
    out.texCoord = in.texCoord;
    out.color = in.color;
    
    return out;
}

// ========== 片段着色器 ==========

fragment float4 fragment_pbr(
    VertexOut in [[stage_in]],
    constant Uniforms& uniforms [[buffer(0)]],
    texture2d<float> albedoTexture [[texture(0)]],
    texture2d<float> normalTexture [[texture(1)]],
    texture2d<float> metallicRoughnessTexture [[texture(2)]],
    sampler textureSampler [[sampler(0)]]
) {
    // 采样纹理
    float3 albedo = albedoTexture.sample(textureSampler, in.texCoord).rgb * uniforms.albedo;
    float3 normalMap = normalTexture.sample(textureSampler, in.texCoord).rgb * 2.0 - 1.0;
    float2 metallicRoughness = metallicRoughnessTexture.sample(textureSampler, in.texCoord).gb;
    
    // 构建TBN矩阵
    float3x3 TBN = float3x3(
        normalize(in.worldTangent),
        normalize(in.worldBitangent),
        normalize(in.worldNormal)
    );
    
    // 计算世界空间法向量
    float3 N = normalize(TBN * normalMap);
    float3 V = normalize(uniforms.cameraPosition - in.worldPosition);
    float3 L = normalize(uniforms.lightPosition - in.worldPosition);
    float3 H = normalize(V + L);
    
    // PBR材质参数
    float metallic = metallicRoughness.x * uniforms.metallic;
    float roughness = metallicRoughness.y * uniforms.roughness;
    
    // 计算反射率
    float3 F0 = mix(float3(0.04), albedo, metallic);
    
    // Cook-Torrance BRDF
    float NDF = distributionGGX(N, H, roughness);
    float G = 1.0; // 简化的几何函数
    float3 F = F0 + (1.0 - F0) * pow(clamp(1.0 - max(dot(H, V), 0.0), 0.0, 1.0), 5.0);
    
    float3 kS = F;
    float3 kD = float3(1.0) - kS;
    kD *= 1.0 - metallic;
    
    float3 numerator = NDF * G * F;
    float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001;
    float3 specular = numerator / denominator;
    
    float NdotL = max(dot(N, L), 0.0);
    float3 Lo = (kD * albedo / 3.14159265359 + specular) * uniforms.lightColor * NdotL;
    
    float3 ambient = uniforms.ambientColor * albedo;
    float3 color = ambient + Lo;
    
    // HDR色调映射
    color = color / (color + float3(1.0));
    color = pow(color, float3(1.0/2.2)); // 伽马校正
    
    return float4(color, 1.0);
}

// ========== 计算着色器示例 ==========

struct Particle {
    float3 position;
    float3 velocity;
    float life;
    float size;
};

kernel void update_particles(
    device Particle* particles [[buffer(0)]],
    constant Uniforms& uniforms [[buffer(1)]],
    uint index [[thread_position_in_grid]]
) {
    Particle& particle = particles[index];
    
    if (particle.life > 0.0) {
        // 更新粒子
        particle.position += particle.velocity * 0.016; // 假设60fps
        particle.velocity.y -= 9.8 * 0.016; // 重力
        particle.life -= 0.016;
        particle.size = particle.life * 2.0;
    } else {
        // 重置粒子
        particle.position = float3(0.0, 0.0, 0.0);
        particle.velocity = float3(
            (float(index % 100) / 50.0 - 1.0) * 5.0,
            10.0 + float(index % 50) / 10.0,
            (float(index % 80) / 40.0 - 1.0) * 5.0
        );
        particle.life = 3.0 + float(index % 100) / 100.0;
        particle.size = 1.0;
    }
}
```

这个完整的指南涵盖了Metal着色器编程的所有重要方面。通过学习和实践这些概念，你可以创建复杂而高效的图形效果和计算程序。记住，Metal着色器的关键是理解GPU的并行处理特性，并针对性地优化你的代码。

```
// NDC 顶点（4 个）
//        let vertexData: [Float] = [
//            -1.0,  1.0, 0.0,  // 0 左上
//            -1.0, -1.0, 0.0,  // 1 左下
//             1.0, -1.0, 0.0,  // 2 右下
//             1.0,  1.0, 0.0,  // 3 右上
//        ]
//// buffer(0): packed_float3 位置数组
//// buffer(1): float2 UV 数组
//// buffer(2): uint 索引数组（长度 6）
//vertex VSOut vertexShader1(uint vertexID [[vertex_id]],
//                           const device packed_float3* inPos [[buffer(0)]],
//                           const device float2*        inUV  [[buffer(1)]],
//                           const device uint*          indices [[buffer(2)]])
//{
//    VSOut o;
//    uint vid = indices[vertexID];         // 通过索引缓冲取真正的顶点号
//    float3 pos = float3(inPos[vid]);      // 从 packed_float3 解包
//    o.position = float4(pos, 1.0);
//    o.uv = inUV[vid];
//    return o;
//}

```

```

#include <metal_stdlib>
using namespace metal;

struct VSOut {
    float4 position [[position]];
    float2 uv;
};

vertex VSOut vertexShader1(uint vertexID [[vertex_id]],
                           const device float2* inPos [[buffer(0)]],
                           const device float2* inUV  [[buffer(1)]],
                           const device uint*   indices [[buffer(2)]])
{
    VSOut o;
    uint vid = indices[vertexID];
    float2 pos = inPos[vid];
    o.position = float4(pos, 0.0, 1.0);   // 把 (x,y) 扩展成 (x,y,0,1)
    o.uv = inUV[vid];
    return o;
}

fragment float4 fragmentShader1(VSOut in [[stage_in]],
                                texture2d<float> tex [[texture(0)]]) {
    constexpr sampler s(mag_filter::linear,
                        min_filter::linear,
                        address::clamp_to_edge);
    return tex.sample(s, in.uv);
}

```

