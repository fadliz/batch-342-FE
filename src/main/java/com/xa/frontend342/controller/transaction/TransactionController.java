package com.xa.frontend342.controller.transaction;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping("transaction")
public class TransactionController {
    @GetMapping("")
    public ModelAndView home() {
        ModelAndView view = new ModelAndView("transaction/index");
        view.addObject("title", "Transaction");
        return view;
    }
    @GetMapping("/form")
    public ModelAndView form() {
        ModelAndView view = new ModelAndView("transaction/form");
        return view;
    }
}
