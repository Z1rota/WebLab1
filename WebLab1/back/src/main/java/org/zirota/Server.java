package org.zirota;

import com.fastcgi.FCGIInterface;



import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Objects;

class Server {
    public static void main (String[] args) {
        FCGIInterface fcgiInterface = new FCGIInterface();
        Validator validator = new Validator();
        HitChecker checker = new HitChecker();

        while(fcgiInterface.FCGIaccept() >= 0) {
            String method = FCGIInterface.request.params.getProperty("REQUEST_METHOD");
            if (method == null) {
                System.out.println(err("Неподдерживаемый метод HTTP"));
                continue;
            }

            if (method.equals("GET")) {

                long time = System.nanoTime();
                String req = null;
                req = FCGIInterface.request.params.getProperty("QUERY_STRING");
                if (!Objects.equals(req, "")) {
                    LinkedHashMap<String, String> m = null;
                    try {
                        m = getValues(req);
                    } catch (Exception e) {
                        System.out.println(err("Не ломайте пж GET запрос"));
                        continue;
                    }
                    boolean isShot;
                    boolean isValid;
                    try {
                        if (m.size() != 3) {
                            throw new RuntimeException("Проверьте, что в вашем запросе только x,y,r");
                        }
                        isValid = validator.validation(Float.parseFloat(m.get("x")), Float.parseFloat(m.get("y")),
                                Float.parseFloat(m.get("r")));
                        isShot = checker.hit(Float.parseFloat(m.get("x")), Float.parseFloat(m.get("y")), Float.parseFloat(m.get("r")));
                    } catch (NumberFormatException e) {
                        System.out.println(err("В данных обнаружены недопустимые символы"));
                        continue;

                    } catch (RuntimeException e) {
                        System.out.println(err(e.getMessage()));
                        continue;
                    }catch (Exception e) {
                        System.out.println(err("Неизвестная ошибка"));
                        continue;
                    }
                    if (isValid) {
                        System.out.println(resp(isShot, m.get("x"), m.get("y"), m.get("r"), time));
                    }
                    else
                        System.out.println(err("Невалидные данные!"));
                }
                else
                    System.out.println(err("Запрос Пустой!"));
            }
            else
                System.out.println(err("Данные должны отправляться GET запросом!"));
      }
    }
    private static LinkedHashMap<String, String> getValues(String inpString)  {
        String[] args = inpString.split("&");
        LinkedHashMap<String, String> map = new LinkedHashMap<>();
        for (String s : args) {
            String[] arg = s.split("=");
            map.put(arg[0], arg[1]);
        }
        return map;
    }
    private static String resp(boolean isShoot, String x, String y, String r, long wt) {
        String content = """
                {"result":"%s","x":"%s","y":"%s","r":"%s","time":"%s","workTime":"%s"}
                """.formatted(isShoot, x, y, r, (double)(System.nanoTime() - wt) / 10000000, LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")));
        return """
                HTTP/1.1 200 OK
                Content-Type: application/json; charset=utf-8
                Content-Length: %d
                
                
                %s
                """.formatted(content.getBytes(StandardCharsets.UTF_8).length, content);
    }

    private static String err(String msg) {
        String content = """
                {"error":"%s"}
                """.formatted(msg);
        return"""
            HTTP/1.1 400 Bad Request
            Content-Type: application/json; charset=utf-8e
            Content-Length: %d
            


            %s\n
            """.formatted(content.getBytes(StandardCharsets.UTF_8).length+1, content);
    }
}