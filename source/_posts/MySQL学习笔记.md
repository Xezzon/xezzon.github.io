---
title: MySQL学习笔记
tags:
  - MySQL
categories: 学习笔记
date: 2020-09-18 00:37:10
---


# MySQL的安装
MySQL其实是由两部分构成的——mysql-server和mysql-client，前者为存储数据的部分，后者为操作部分。
## 安装mysql-server
### [Arch Linux](https://wiki.archlinux.org/index.php/MariaDB_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))
```shell
pacman -S mariadb
```
> 注：mariadb为MySQL的开源实现，也是Arch Linux默认的MySQL的实现。
> 安装完成后，运行之前，执行以下命令：
```shell
mysql_install_db --user=mysql --basedir=/usr --datadir=/var/lib/mysql
```
至此，MySQL已安装完毕。

## 运行mysql-server
执行以下命令：
```shell
systemctl start mysqld
```
执行完毕，若没有报错，则表示mysql-server已成功的运行在本计算机上了。但是每次重启后需要手动启动。可以使用如下命令，使本计算机每次重启后自动运行mysql-server：
```shell
systemctl enable mysqld
```
初次运行mysql-client,需要执行以下命令，进行数据库密码配置：
```shell
mysql_secure_installation
```
至此，已经可以开始使用mysql-server了。

<!-- more -->

## 安装mysql-client
安装Arch Linux的mariadb包会自动安装mariadb-client。若未自动安装，执行以下命令：
```shell
pacman -S mariadb-clients
```
## 使用mysql-client连接mysql-server
执行命令：
```shell
mysql -u root -p
```
执行后，会要求输入root账户密码，该密码为步骤[运行mysql-server](#运行mysql-server)中，执行`mysql_secure_installation`时设置的密码。

命令执行完毕，shell窗口进入MySQL控制台状态，就可以开始编写和执行SQL语句了。

## 安装[DBeaver](https://dbeaver.io/)

dbeaver的作用与mysql-client是一致的，可以作为mysql-client的替代。

dbeaver是一款开源的、免费的、跨平台的数据库可视化管理工具，它支持主流的SQL数据库，如MySQL、PostgreSQL、Oracle Database、SQLite、SQL Server等。

通过dbeaver可以进行数据库的配置、数据表设计以及SQL语句的编写与执行等操作。

# 后端的MySQL学习地图

SQL的基础概念为——CURD（增create,改update,查read,删delete）。通过dbeaver可以非常清晰的看到，MySQL是分为两级的：数据库（database）和数据表（table）。结合两者来看，数据库的基本操作就是对数据库和数据表的增删改查。

基础概念之上，还有一些进阶的概念——约束、索引、explain、视图、事务。

除此之外还有一些概念，但是是DBA要掌握但不需要后端掌握的，包括但不限于引擎、存储过程（《Java开发手册》不推荐使用存储过程，因为*存储过程难以调试和扩展，且不具备可移植性*）、触发器。

以下命令中的中文均要替换为实际的数据库名、表名或字段名等。

## 数据库的增、删、改、查

注：所有命令，既可以通过mysql-client执行，也可以通过dbeaver执行（前面说过，他们的作用是一致的，都是对数据库进行操作）。

新增数据库：

```mysql
CREATE DATABASE 数据库名;
```

删除数据库：

```mysql
DROP DATABASE 数据库名;
```

查询已有数据库：

```mysql
SHOW DATABASES;
```

选择当前数据库：

```MYSQL
USE 数据库名;
```

> 注：关于数据库的操作，往往不需要后端人员手写命令，而是通过数据可视化工具（如dbeaver）进行操作。实际上，需要后端人员手写命令的，只有对数据的增删改查。

## 数据表的增、删、改、查

通过dbeaver可以看到，数据可视化的结果是一张表。从表上看，每一列为一个字段，每一行为一条数据（或称记录）。对应到Java中，一张表为一个[JavaBean](https://www.liaoxuefeng.com/wiki/1252599548343744/1260474416351680)，字段即为JavaBean的属性，一条记录对应一个JavaBean的对象。每个字段都有其数据类型，也就是说，同一列的数据都是同一类型的。

新增数据表：

```mysql
CREATE TABLE 数据表名 (字段名1 字段类型, 字段名2 字段类型, ...);
```

实际开发中，新增数据表的命令比这个复杂得多，但是通常是通过dbeaver进行表设计的，所以这里不详细展开。修改数据表结构亦是如此。

修改数据表结构：

```mysql
ALTER TABLE 数据表名 ...;
```

查看数据表结构：

```MYSQL
DESC 数据表名;
```

删除数据表：

```mysql
DROP TABLE 数据表名;
```

### 字段数据类型

MySQL数据类型可分五大类：数值型、字符串型、日期时间型、二进制类型、其他类型。

- 数值型

  | 数据类型             | 大小(bytes)   | 范围                                      | 说明                                                         |
  | -------------------- | ------------- | ----------------------------------------- | ------------------------------------------------------------ |
  | TINYINT [UNSIGNED]   | 1             | 有符号：[-128, 127)<br />无符号：[0, 255) | Java中的Boolean类型映射为MySQL的TINYINT UNSIGNED。           |
  | SMALLINT [UNSIGNED]  | 2             | 略                                        | 根据数据的实际用途选择合适大小的数值类型。                   |
  | MEDIUMINT [UNSIGNED] | 3             | 略                                        | 根据数据的实际用途选择合适大小的数值类型。                   |
  | INT [UNSIGNED]       | 4             | 略                                        | 根据数据的实际用途选择合适大小的数值类型。                   |
  | BIGINT [UNSIGNED]    | 8             | 略                                        | 每张表必须包含id字段，且数据类型为BIGINT UNSIGNED。          |
  | DECIMAL(M, D)        | min(M+2, D+2) | 略                                        | 开发中，小数的存储必须使用DECIMAL类型，映射JavaBean中的String或BigDecimal类型。 |
  > 对于整数类型，长度为n，则有符号范围为[-2^8·n-1^, 2^8·n-1^-1)，无符号范围为[0, 2^8·n^-1)。
  
  不常用
  
  | 数据类型          | 大小(bytes) | 说明                                                   |
  | ----------------- | ----------- | ------------------------------------------------------ |
  | FLOAT [UNSIGNED]  | 4           | FLOAT存储小数会存在精度损失，所以开发中不使用此类型。  |
  | DOUBLE [UNSIGNED] | 8           | DOUBLE存储小数会存在精度损失，所以开发中不使用此类型。 |
  
- 字符串型

  | 数据类型   | 长度(bytes)   | 描述       |
  | ---------- | ------------- | ---------- |
  | CHAR       | 0 - (2^8^-1)  | 定长字符串 |
  | VARCHAR    | 0 - (2^16^-1) | 变长字符串 |
  | TEXT       | 0 - (2^16^-1) | 长文本数据 |
  | TINYTEXT   | 0 - (2^8^-1)  |            |
  | MEDIUMTEXT | 0 - (2^24^-1) |            |
  | LONGTEXT   | 0 - (2^32^-1) |            |
  
- 日期时间型

  | 数据类型  | 格式                | 大小(bytes) |
  | --------- | ------------------- | ----------- |
  | TIMESTAMP | yyyy-MM-dd HH:mm:ss | 4           |
  | DATE      | yyyy-MM-dd          | 3           |
  | TIME      | HH:mm:ss            | 3           |
  > TIMESTAMP会将时间存储为UTC时间，而DATETIME不会，所以实际开发中，使用TIMESTAMP而不是DATETIME，需要注意的是，这一点与《Java开发手册》相悖。至于为什么《Java开发手册》不建议使用TIMESTAMP，个人猜测是因为TIMESTAMP只能用到2038-1-19 11:14:07。

  不常用

  | 数据类型 | 格式                | 大小(bytes) |
  | -------- | ------------------- | ----------- |
  | DATETIME | yyyy-MM-dd HH:mm:ss | 8           |
  | YEAR     | YYYY                | 1           |

- 二进制类型

  | 数据类型   |
  | ---------- |
  | BIT        |
  | BINARY     |
  | BLOB       |
  | VARBINARY  |
  | TINYBLOB   |
  | MEDIUMBLOB |
  | LONGBLOB   |
  
- 其他类型

  | 数据类型 | 说明                                                         |
  | -------- | ------------------------------------------------------------ |
  | json     | 应用场景特别少。存储非结构化的数据建议使用NoSQL型的数据库；存储JSON文本可以使用TEXT类型。如果要在SQL中使用json类型，类型处理器得自己写。 |
  | BOOL     | BOOL的底层是TINYINT(1)                                       |
  | ENUM     | 不建议使用。即便要对Java中的枚举进行映射，也建议使用Mybatis的EnumOrdinalTypeHandler，在MySQL中对应字段使用TINYINT UNSIGNED或SMALLINT UNSIGNED类型，注意，若使用EnumOrdinalTypeHandler，enum中枚举值的顺序不能改变！ |

## 数据的增、删、改

插入数据：

```mysql
INSERT INTO 表名(字段1, 字段2, ...) 
VALUES (value1, value2, ...),
	(value1, value2, ...),
	...;
```

更新数据：

```mysql
UPDATE 表名
SET
	字段1 = 表达式1,
	字段2 = 表达式2,
	...
WHERE
	条件;
```

删除数据：

```mysql
DELETE FROM 表名 WHERE 条件;
```

或者：

```mysql
TRUNCATE TABLE 表名;
```

## 数据的查询

对数据的增删改查是MySQL基础操作的重点，查询又是数据增删改查的重点。对数据的查询从易至难分别是一般查询、聚合查询、分页查询、多表联查。

```mysql
SELECT
	t1.字段1, t1.字段2, t2.字段3, t2.字段4, ...
FROM
	表1 AS t1
[INNER | LEFT | RIGHT] JOIN 表2 AS t2
ON 联合条件
WHERE 查询条件
GROUP BY t1.字段1
HAVING 分组条件
ORDER BY t2.字段2
LIMIT 页码, 页面大小;
```

其中，第1-4行为必需的。第5行为多表联查，第6-10行为聚合查询，第11行为分页查询。

## 聚合查询



## 多表联查



## 分页查询



## 数据表约束



### 主键约束



### 外键约束



> **禁止使用外键约束。**外键概念需要在应用层解决，因为它会影响数据的插入速度。

### 唯一值约束



### 非空约束



> **所有字段都设置非空约束。**字符串类型的null值默认为空字符串，数值类型的null值默认为0，日期类型的null值默认为current_timestamp()或是"'0000-00-00 00:00:00'"。
>
> 个人体会：将所有字段设置为非空，那么从数据库中查出的数据就不存在null值，一则，可以避免烦人的NPE和null值判断，二则，将返回前端的数据设置不序列化null值，可以达到控制响应字段的效果。

### 检查约束

MySQL不要求掌握检查约束。

## 索引与explain优化

### 索引类型

- 普通索引

  

- 主键索引

  

- 唯一索引

  

## Java类型与MySQL类型映射

| Java类型                | MySQL类型                                               | Mybatis类型处理器                      |
| ----------------------- | ------------------------------------------------------- | -------------------------------------- |
| java.lang.Boolean       | TINYINT(1) UNSIGNED                                     | BooleanTypeHandler                     |
| java.lang.Integer       | TINYINT, SAMLLINT [UNSIGNED], MEDIUMINT [UNSIGNED], INT | IntegerTypeHandler                     |
| java.lang.Long          | INT UNSIGNED, BIGINT                                    | LongTypeHandler                        |
| java.math.BigInteger    | BIGINT UNSIGNED                                         | 无自带的类型处理器                     |
| java.lang.String        | CHAR, VARCHAR, TEXT                                     | StringTypeHandler                      |
| java.time.LocalDateTime | TIMESTAMP                                               | LocalDateTimeTypeHandler               |
| java.time.LocalDate     | DATE                                                    | LocalDateTypeHandler                   |
| java.time.LocalTime     | TIME                                                    | LocalTimeTypeHandler                   |
| <Enumeration Type>      | VARCHAR, TINYINT UNSIGNED, SMALLINT UNSIGNED            | EnumTypeHandler/EnumOrdinalTypeHandler |

# Tips

## SQL与MySQL的关系

RDBMS：Relational Database Management System，关系型数据库管理系统。 

MySQL：MySQL是RDBMS的一个实例。

SQL：Stuctured Query Language，结构化查询语言。是一种基于关系型数据库的语言标准，但是不同的RDBMS的实例（如Oracle Database和MySQL）对SQL的实现不尽相同。其实这种情况不止出现在SQL语言上，大名鼎鼎的C语言，也有很多“方言”。

## 数据库规范



# MySQL知识点挖掘

## 范式

未完待续...