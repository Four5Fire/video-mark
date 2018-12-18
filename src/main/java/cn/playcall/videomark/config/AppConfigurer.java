package cn.playcall.videomark.config;

import cn.playcall.videomark.interceptor.IndexInterceptor;
import cn.playcall.videomark.interceptor.ResultInterceptor;
import cn.playcall.videomark.interceptor.VideoInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;

@Configuration
public class AppConfigurer extends WebMvcConfigurationSupport {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new IndexInterceptor()).addPathPatterns("/casia/index");
        registry.addInterceptor(new VideoInterceptor()).addPathPatterns("/casia/video");
        registry.addInterceptor(new ResultInterceptor()).addPathPatterns("/casia/result");
        super.addInterceptors(registry);
    }

    @Override
    protected void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**").addResourceLocations("classpath:/META-INF/resources/")
                .addResourceLocations("classpath:/resources/")
                .addResourceLocations("classpath:/static/")
                .addResourceLocations("classpath:/css");
        super.addResourceHandlers(registry);
    }


}
