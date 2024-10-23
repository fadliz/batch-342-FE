package com.xa.frontend342.controller.home;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping("")
public class HomeController {
    @GetMapping("")
    public ModelAndView home() {
        ModelAndView view = new ModelAndView("home/index");
        view.addObject("title", "Home Page");
        return view;
    }
}
