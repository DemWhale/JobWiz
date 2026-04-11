package com.offershow.job.wiz.dal.config;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.config.GlobalConfig;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import com.baomidou.mybatisplus.extension.spring.MybatisSqlSessionFactoryBean;
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;

/**
 * MyBatis Plus 完整配置类
 * 手动管理 DataSource 和 SqlSessionFactory
 */
@Configuration
@MapperScan(
        basePackages = "com.offershow.job.wiz.dal.mapper",
        annotationClass = org.apache.ibatis.annotations.Mapper.class,
        sqlSessionFactoryRef = "jobWizSqlSessionFactory",
        sqlSessionTemplateRef = "jobWizSqlSessionTemplate"
)
public class JobWizMybatisPlusConfig {

    @Value("${spring.datasource.url}")
    private String jdbcUrl;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @Value("${spring.datasource.driver-class-name}")
    private String driverClassName;

    /**
     * 创建数据源 Bean
     *
     * @return DataSource 数据源
     */
    @Bean(name = "jobWizDataSource")
    public DataSource jobWizDataSource() {
        com.zaxxer.hikari.HikariConfig hikariConfig = new com.zaxxer.hikari.HikariConfig();
        hikariConfig.setJdbcUrl(jdbcUrl);
        hikariConfig.setUsername(username);
        hikariConfig.setPassword(password);
        hikariConfig.setDriverClassName(driverClassName);

        // 连接池配置
        hikariConfig.setMinimumIdle(5);
        hikariConfig.setMaximumPoolSize(20);
        hikariConfig.setConnectionTimeout(30000);
        hikariConfig.setIdleTimeout(600000);
        hikariConfig.setMaxLifetime(1800000);

        return new com.zaxxer.hikari.HikariDataSource(hikariConfig);
    }

    /**
     * 创建 SqlSessionFactory Bean
     * 依赖 DataSource Bean
     *
     * @param dataSource 数据源
     * @return SqlSessionFactory
     * @throws Exception 创建失败时抛出异常
     */
    @Bean(name = "jobWizSqlSessionFactory")
    public SqlSessionFactory jobWizSqlSessionFactory(
            @Qualifier("jobWizDataSource") DataSource dataSource,
            @Qualifier("jobWizMybatisConfiguration") MybatisConfiguration configuration,
            @Qualifier("jobWizPaginationInterceptor") PaginationInnerInterceptor paginationInnerInterceptor,
            @Qualifier("jobWizGlobalConfig") GlobalConfig globalConfig,
            @Value("classpath*:mapper/**/*.xml") Resource[] mapperLocations
    ) throws Exception {
        MybatisSqlSessionFactoryBean factoryBean = new MybatisSqlSessionFactoryBean();
        factoryBean.setDataSource(dataSource);
        factoryBean.setConfiguration(configuration);
        factoryBean.setMapperLocations(mapperLocations);
        factoryBean.setGlobalConfig(globalConfig);

        // 配置 MyBatis Plus 拦截器
        MybatisPlusInterceptor mybatisPlusInterceptor = new MybatisPlusInterceptor();
        mybatisPlusInterceptor.addInnerInterceptor(paginationInnerInterceptor);
        factoryBean.setPlugins(mybatisPlusInterceptor);

        return factoryBean.getObject();
    }

    @Bean(name = "jobWizMybatisConfiguration")
    public MybatisConfiguration jobWizMybatisConfiguration() {
        // MyBatis 配置
        MybatisConfiguration configuration = new MybatisConfiguration();
        configuration.setMapUnderscoreToCamelCase(true); // 驼峰命名转换
        configuration.setCacheEnabled(false); // 关闭缓存
        configuration.setAggressiveLazyLoading(true); // 激活延迟加载
        configuration.setCallSettersOnNulls(true); // 当结果集中某个字段为 null 时，也调用 setter 方法
        configuration.setLogImpl(org.apache.ibatis.logging.stdout.StdOutImpl.class); // 日志实现
        return configuration;
    }

    @Bean(name = "jobWizPaginationInterceptor")
    public PaginationInnerInterceptor jobWizPaginationInterceptor() {
        PaginationInnerInterceptor paginationInnerInterceptor = new PaginationInnerInterceptor(DbType.MYSQL);
        paginationInnerInterceptor.setMaxLimit(1000L);
        paginationInnerInterceptor.setOverflow(false);
        return paginationInnerInterceptor;
    }

    @Bean(name = "jobWizGlobalConfig")
    public GlobalConfig jobWizGlobalConfig() {
        GlobalConfig globalConfig = new GlobalConfig();
        globalConfig.setDbConfig(new GlobalConfig.DbConfig()
                .setIdType(com.baomidou.mybatisplus.annotation.IdType.AUTO)
                .setTableUnderline(true));
        return globalConfig;
    }


    /**
     * 创建 SqlSessionTemplate Bean
     *
     * @param sqlSessionFactory SqlSessionFactory
     * @return SqlSessionTemplate
     * @throws Exception 创建失败时抛出异常
     */
    @Bean(name = "jobWizSqlSessionTemplate")
    public SqlSessionTemplate jobWizSqlSessionTemplate(
            @Qualifier("jobWizSqlSessionFactory") SqlSessionFactory sqlSessionFactory) throws Exception {
        return new SqlSessionTemplate(sqlSessionFactory);
    }

    /**
     * 创建事务管理器 Bean
     *
     * @param dataSource 数据源
     * @return PlatformTransactionManager 事务管理器
     */
    @Bean(name = "jobWizTransactionManager")
    public PlatformTransactionManager jobWizTransactionManager(@Qualifier("jobWizDataSource") DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }

}
