const maybe: Lambda = {
    kind: 'lambda',
    apply(expr: Rule): Rule {
        return {
            kind: 'rule',

            parse() {
                return expr.parse() || epsilon.parse();
            },

            unparse() {
                return expr.unparse() || epsilon.unparse();
            },
        };
    },
};
