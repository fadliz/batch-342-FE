package com.xa.frontend342.controller.product;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping("product")
public class ProductController {
    @GetMapping("")
    public ModelAndView home() {
        ModelAndView view = new ModelAndView("product/index");
        view.addObject("title", "Product");
        return view;
    }
    @GetMapping("/form")
    public ModelAndView form() {
        ModelAndView view = new ModelAndView("product/form");
        return view;
    }
}
