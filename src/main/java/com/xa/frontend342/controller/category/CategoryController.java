package com.xa.frontend342.controller.category;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping("category")
public class CategoryController {
    @GetMapping("")
    public ModelAndView home() {
        ModelAndView view = new ModelAndView("category/index");
        view.addObject("title", "Category");
        return view;
    }
    @GetMapping("/form")
    public ModelAndView form() {
        ModelAndView view = new ModelAndView("category/form");
        return view;
    }
}
