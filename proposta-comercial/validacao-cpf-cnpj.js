// Validação de CPF e CNPJ

// Validar CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validar primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
    
    // Validar segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

// Validar CNPJ
function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]/g, '');
    
    if (cnpj.length !== 14) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    
    // Validar primeiro dígito verificador
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    
    // Validar segundo dígito verificador
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) return false;
    
    return true;
}

// Validar CPF ou CNPJ
function validarCPFouCNPJ(valor) {
    valor = valor.replace(/[^\d]/g, '');
    
    if (valor.length === 11) {
        return {
            valido: validarCPF(valor),
            tipo: 'CPF'
        };
    } else if (valor.length === 14) {
        return {
            valido: validarCNPJ(valor),
            tipo: 'CNPJ'
        };
    } else {
        return {
            valido: false,
            tipo: 'INVÁLIDO'
        };
    }
}

// Formatar CPF (XXX.XXX.XXX-XX)
function formatarCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Formatar CNPJ (XX.XXX.XXX/XXXX-XX)
function formatarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]/g, '');
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

// Aplicar máscara dinamicamente (CPF ou CNPJ)
function aplicarMascaraCPFouCNPJ(input) {
    let valor = input.value.replace(/[^\d]/g, '');
    
    if (valor.length <= 11) {
        // Máscara de CPF
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
        // Máscara de CNPJ
        valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
        valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
        valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
    }
    
    input.value = valor;
}

// Validar em tempo real com feedback visual
function validarCPFouCNPJComFeedback(input, feedbackElement) {
    const valor = input.value.replace(/[^\d]/g, '');
    
    if (valor.length === 0) {
        input.classList.remove('valido', 'invalido');
        if (feedbackElement) {
            feedbackElement.textContent = '';
            feedbackElement.style.display = 'none';
        }
        return null;
    }
    
    if (valor.length !== 11 && valor.length !== 14) {
        input.classList.remove('valido');
        input.classList.add('invalido');
        if (feedbackElement) {
            feedbackElement.textContent = 'Digite um CPF (11 dígitos) ou CNPJ (14 dígitos) válido';
            feedbackElement.style.display = 'block';
            feedbackElement.style.color = '#FF6B6B';
        }
        return false;
    }
    
    const resultado = validarCPFouCNPJ(valor);
    
    if (resultado.valido) {
        input.classList.remove('invalido');
        input.classList.add('valido');
        if (feedbackElement) {
            feedbackElement.textContent = `✓ ${resultado.tipo} válido`;
            feedbackElement.style.display = 'block';
            feedbackElement.style.color = '#10B981';
        }
        return true;
    } else {
        input.classList.remove('valido');
        input.classList.add('invalido');
        if (feedbackElement) {
            feedbackElement.textContent = `✗ ${resultado.tipo} inválido`;
            feedbackElement.style.display = 'block';
            feedbackElement.style.color = '#FF6B6B';
        }
        return false;
    }
}

// Exportar funções
window.validacaoCPFCNPJ = {
    validarCPF,
    validarCNPJ,
    validarCPFouCNPJ,
    formatarCPF,
    formatarCNPJ,
    aplicarMascaraCPFouCNPJ,
    validarCPFouCNPJComFeedback
};
