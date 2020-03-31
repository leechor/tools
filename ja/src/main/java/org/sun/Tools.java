package org.sun;

import java.io.File;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;

/**
 * @author sunlichao
 * @date 2020/3/31
 */
public class Tools {

    /**
     *
     * @param path 为包路径的上级如test.org.sun.tools, 则为test
     * @param classLoader 类加载器
     */
    public static void setClassLoadPath(String path, ClassLoader classLoader) {
        Method method = null;
        try {
            method = URLClassLoader.class.getDeclaredMethod("addURL", URL.class);
        } catch (NoSuchMethodException e) {
            e.printStackTrace();
        }
        assert method != null;
        boolean accessible = method.isAccessible();
        try {
            if (!accessible) {
                method.setAccessible(true);
            }
            // 将当前类路径加入到类加载器中
            method.invoke(classLoader, new File(path).toURI().toURL());
        } catch (IllegalAccessException | InvocationTargetException | MalformedURLException e) {
            e.printStackTrace();
        } finally {
            method.setAccessible(accessible);
        }
    }


}
