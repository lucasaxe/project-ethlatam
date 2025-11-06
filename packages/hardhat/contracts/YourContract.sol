// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "hardhat/console.sol"; // Para usar console.log

contract YourContract {
    
    // --- Estruturas de Dados (Os "Modelos") ---

    // Define o que é uma ONG
    struct NGO {
        string name;            // Nome da ONG
        address owner;         // O endereço da carteira que controla esta ONG
        uint256 reputation;    // A reputação, baseada em curtidas
        bool isRegistered;    // Para verificar se a ONG existe
    }

    // Define o que é um Post
    struct Post {
        uint256 postId;        // ID único do post
        address ngoOwner;      // Endereço da ONG que criou o post
        string contentUrl;     // Link para a foto + descrição (ex: IPFS ou http)
        uint256 likeCount;     // Quantidade de curtidas
        uint256 totalDonated;  // Total de ETH (em Wei) doado a este post
    }

    // --- Armazenamento (O "Banco de Dados") ---

    // Mapeamento: "Dicionário" que liga um endereço de carteira (address)
    // à sua respectiva estrutura (struct) de ONG.
    mapping(address => NGO) public ngos;

    // Um "Array" (lista) que armazena todos os posts.
    // O ID de um post será seu índice (0, 1, 2, ...)
    Post[] public allPosts;

    // Mapeamento aninhado: "Dicionário de dicionários"
    // Usado para rastrear SE um usuário (address) JÁ curtiu (bool) um post (uint256).
    // Isso impede curtidas duplicadas.
    // hasLiked[POST_ID][USUARIO] = true/false
    mapping(uint256 => mapping(address => bool)) public hasLiked;

    // --- Eventos (Os "Alertas" para o Frontend) ---
    // Boas práticas: emita eventos quando o estado mudar.
    event NGORegistered(address indexed ngoAddress, string name);
    event PostCreated(uint256 indexed postId, address indexed ngoAddress, string contentUrl);
    event PostLiked(uint256 indexed postId, address indexed liker, uint256 newLikeCount);
    event PostDonated(uint256 indexed postId, address indexed donator, uint256 amount);

    // --- Funções (A "API" do seu Backend) ---

    /**
     * @dev Permite que um novo usuário se registre como uma ONG.
     */
    function registerNGO(string memory _name) public {
        // 'msg.sender' é o endereço da carteira que está chamando a função.
        address _ngoOwner = msg.sender;

        // 'require' é uma "trava". Se a condição for falsa, a transação falha.
        // Impede que uma ONG já registrada se registre novamente.
        require(!ngos[_ngoOwner].isRegistered, "ONG ja registrada");

        // Cria a nova ONG no "banco de dados" (mapping)
        ngos[_ngoOwner] = NGO({
            name: _name,
            owner: _ngoOwner,
            reputation: 0,
            isRegistered: true
        });

        emit NGORegistered(_ngoOwner, _name);
    }

    /**
     * @dev Permite que uma ONG registrada crie um novo post.
     * '_contentUrl' é o link para a foto/descrição (ex: "ipfs://...")
     */
    function createPost(string memory _contentUrl) public {
        address _ngoOwner = msg.sender;

        // Trava: Somente ONGs registradas podem postar.
        require(ngos[_ngoOwner].isRegistered, "Voce nao e uma ONG registrada");

        // Pega o ID para o novo post (será o tamanho atual da lista)
        uint256 _postId = allPosts.length;

        // Cria o novo post
        Post memory newPost = Post({
            postId: _postId,
            ngoOwner: _ngoOwner,
            contentUrl: _contentUrl,
            likeCount: 0,
            totalDonated: 0
        });

        // Adiciona o novo post à lista (array)
        allPosts.push(newPost);

        emit PostCreated(_postId, _ngoOwner, _contentUrl);
    }

    /**
     * @dev Permite que qualquer usuário curta um post.
     * '_postId' é o ID (número) do post que está sendo curtido.
     */
    function likePost(uint256 _postId) public {
        address _liker = msg.sender;

        // Trava: Garante que o Post ID exista (seja menor que o tamanho da lista)
        require(_postId < allPosts.length, "Post nao existe");

        // Trava: Impede curtida duplicada
        require(!hasLiked[_postId][_liker], "Voce ja curtiu este post");

        // Pega o post do array para editar
        Post storage post = allPosts[_postId];

        // Pega a ONG dona do post para editar
        NGO storage ngo = ngos[post.ngoOwner];

        // --- A LÓGICA PRINCIPAL ---
        // 1. Marca que o usuário curtiu
        hasLiked[_postId][_liker] = true;
        // 2. Incrementa a contagem de curtidas do post
        post.likeCount += 1;
        // 3. Incrementa a reputação da ONG (aqui a regra de 1 like = 1 reputação)
        ngo.reputation += 1;

        emit PostLiked(_postId, _liker, post.likeCount);
    }

    /**
     * @dev Permite que qualquer usuário envie ETH (doação) para um post.
     * 'payable' é o que permite a função receber cripto.
     */
    function donateToPost(uint256 _postId) public payable {
        // Trava: Garante que o Post ID exista
        require(_postId < allPosts.length, "Post nao existe");

        // Trava: Garante que a doação seja maior que zero
        // 'msg.value' é a quantidade de ETH enviada na transação
        require(msg.value > 0, "Voce deve enviar alguma quantia");

        // Pega o post
        Post storage post = allPosts[_postId];

        // --- A LÓGICA DA DOAÇÃO ---
        // 1. Adiciona o valor ao total de doações do post
        post.totalDonated += msg.value;

        // 2. PEGA O ENDEREÇO DA ONG DONA DO POST
        address _ngoOwner = post.ngoOwner;

        // 3. TRANSFERE O DINHEIRO (msg.value) PARA A ONG
        // 'payable(...)' converte o endereço para um tipo que pode receber ETH
        (bool success, ) = payable(_ngoOwner).call{value: msg.value}("");
        // Se a transferência falhar, 'require' reverte toda a transação
        require(success, "Transferencia falhou");

        emit PostDonated(_postId, msg.sender, msg.value);
    }
}