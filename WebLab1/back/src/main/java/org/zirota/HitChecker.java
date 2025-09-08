package org.zirota;

public class HitChecker {
    public boolean hit(float x, float y, float r) {
        return square(x,y,r) || circle(x,y,r) || triangle(x,y,r);
    }


    private boolean square(float x, float y, float r) {
        return x >= 0 && y >= 0 && x <= r && y <= r;
    }

    private boolean circle(float x, float y, float r) {
        return x <= 0 && y >= 0 && (x * x + y * y) <= r * r;
    }

    private boolean triangle(float x, float y, float r) {
        return x >= 0 && y <= 0 &&
                y >= (-2 * r / r) * x - r &&
                x <= r/2 && y >= -r;
    }
}
