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
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.Resource;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;

/**
 * MyBatis Plus 完整配置类（SQLite）
 * 手动管理 DataSource 和 SqlSessionFactory
 */
@Configuration
@Profile("testing")
@MapperScan(
        basePackages = "com.offershow.job.wiz.dal.mapper",
        annotationClass = org.apache.ibatis.annotations.Mapper.class,
        sqlSessionFactoryRef = "jobWizSqlSessionFactory",
        sqlSessionTemplateRef = "jobWizSqlSessionTemplate"
)
public class JobWizSqliteConfig {

    @Value("${spring.datasource.url}")
    private String jdbcUrl;

    @Value("${spring.datasource.driver-class-name}")
    private String driverClassName;

    /**
     * 创建数据源 Bean（SQLite）
     *
     * @return DataSource 数据源
     */
    @Bean(name = "jobWizDataSource")
    public DataSource jobWizDataSource() {
        com.zaxxer.hikari.HikariConfig hikariConfig = new com.zaxxer.hikari.HikariConfig();
        hikariConfig.setJdbcUrl(jdbcUrl);
        hikariConfig.setDriverClassName(driverClassName);

        // SQLite 连接池配置（单写者模型，连接池无需过大）
        hikariConfig.setMinimumIdle(1);
        hikariConfig.setMaximumPoolSize(2);
        hikariConfig.setConnectionTimeout(30000);

        return new com.zaxxer.hikari.HikariDataSource(hikariConfig);
    }

    /**
     * 创建 SqlSessionFactory Bean
     *
     * @param dataSource  数据源
     * @param configuration MyBatis 配置
     * @param paginationInnerInterceptor 分页拦截器
     * @param globalConfig 全局配置
     * @param mapperLocations Mapper XML 路径
     * @return SqlSessionFactory
     * @throws Exception 创建失败时抛出异常
     */
    @Bean(name = "jobWizSqlSessionFactory")
    public SqlSessionFactory jobWizSqlSessionFactory(
            @Qualifier("jobWizDataSource") DataSource dataSource,
            @Qualifier("jobWizSqliteMybatisConfiguration") MybatisConfiguration configuration,
            @Qualifier("jobWizSqlitePaginationInterceptor") PaginationInnerInterceptor paginationInnerInterceptor,
            @Qualifier("jobWizSqliteGlobalConfig") GlobalConfig globalConfig,
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

    @Bean(name = "jobWizSqliteMybatisConfiguration")
    public MybatisConfiguration jobWizMybatisConfiguration() {
        MybatisConfiguration configuration = new MybatisConfiguration();
        configuration.setMapUnderscoreToCamelCase(true);
        configuration.setCacheEnabled(false);
        configuration.setAggressiveLazyLoading(true);
        configuration.setCallSettersOnNulls(true);
        configuration.setLogImpl(org.apache.ibatis.logging.stdout.StdOutImpl.class);
        return configuration;
    }

    @Bean(name = "jobWizSqlitePaginationInterceptor")
    public PaginationInnerInterceptor jobWizPaginationInterceptor() {
        PaginationInnerInterceptor paginationInnerInterceptor = new PaginationInnerInterceptor(DbType.SQLITE);
        paginationInnerInterceptor.setMaxLimit(1000L);
        paginationInnerInterceptor.setOverflow(false);
        return paginationInnerInterceptor;
    }

    @Bean(name = "jobWizSqliteGlobalConfig")
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
     */
    @Bean(name = "jobWizSqlSessionTemplate")
    public SqlSessionTemplate jobWizSqlSessionTemplate(
            @Qualifier("jobWizSqlSessionFactory") SqlSessionFactory sqlSessionFactory) {
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
